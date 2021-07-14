package cluster

import (
	"context"
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
	"time"

	application "github.com/kobsio/kobs/pkg/api/apis/application/v1beta1"
	dashboard "github.com/kobsio/kobs/pkg/api/apis/dashboard/v1beta1"
	team "github.com/kobsio/kobs/pkg/api/apis/team/v1beta1"
	applicationClientsetVersioned "github.com/kobsio/kobs/pkg/api/clients/application/clientset/versioned"
	dashboardClientsetVersioned "github.com/kobsio/kobs/pkg/api/clients/dashboard/clientset/versioned"
	teamClientsetVersioned "github.com/kobsio/kobs/pkg/api/clients/team/clientset/versioned"
	"github.com/sirupsen/logrus"
	corev1 "k8s.io/api/core/v1"
	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

var (
	log       = logrus.WithFields(logrus.Fields{"package": "clusters"})
	slugifyRe = regexp.MustCompile("[^a-z0-9]+")
)

// Cluster is a Kubernetes cluster. It contains all required fields to interact with the cluster and it's services.
type Cluster struct {
	cache                Cache
	clientset            *kubernetes.Clientset
	applicationClientset *applicationClientsetVersioned.Clientset
	teamClientset        *teamClientsetVersioned.Clientset
	dashboardClientset   *dashboardClientsetVersioned.Clientset
	name                 string
	crds                 []CRD
}

// CRD is the format of a Custom Resource Definition. Each CRD must contain a path and resource, which are used for the
// API request to retrieve all CRs for a CRD. It also must contain a title (kind), an optional description, the scope of
// the CRs (namespaced vs. cluster) and an optional list of columns with the fields, which should be shown in the
// frontend table.
type CRD struct {
	Path        string      `json:"path"`
	Resource    string      `json:"resource"`
	Title       string      `json:"title"`
	Description string      `json:"description"`
	Scope       string      `json:"scope"`
	Columns     []CRDColumn `json:"columns,omitempty"`
}

// CRDColumn is a single column for the CRD. A column has the same fields as the additionalPrinterColumns from the CRD
// specs. This means each column contains a description, name, a type to formate the value returned by the given
// jsonPath.
type CRDColumn struct {
	Description string `json:"description"`
	JSONPath    string `json:"jsonPath"`
	Name        string `json:"name"`
	Type        string `json:"type"`
}

// Cache implements a simple caching layer, for the loaded manifest files. The goal of the caching layer is to return
// the manifests faster to the user.
type Cache struct {
	namespaces          []string
	namespacesLastFetch time.Time
}

// GetName returns the name of the cluster.
func (c *Cluster) GetName() string {
	return c.name
}

// GetCRDs returns all CRDs of the cluster.
func (c *Cluster) GetCRDs() []CRD {
	return c.crds
}

// GetNamespaces returns all namespaces for the cluster. To reduce the latency and the number of API calls, we are
// "caching" the namespaces. This means that if a new namespace is created in a cluster, this namespaces is only shown
// after the configured cache duration.
func (c *Cluster) GetNamespaces(ctx context.Context, cacheDuration time.Duration) ([]string, error) {
	log.WithFields(logrus.Fields{"last fetch": c.cache.namespacesLastFetch}).Tracef("Last namespace fetch.")

	if c.cache.namespacesLastFetch.After(time.Now().Add(-1 * cacheDuration)) {
		log.WithFields(logrus.Fields{"cluster": c.name}).Debugf("Return namespaces from cache.")

		return c.cache.namespaces, nil
	}

	namespaceList, err := c.clientset.CoreV1().Namespaces().List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	var namespaces []string

	for _, namespace := range namespaceList.Items {
		namespaces = append(namespaces, namespace.ObjectMeta.Name)
	}

	log.WithFields(logrus.Fields{"cluster": c.name}).Debugf("Return namespaces from Kubernetes API.")
	c.cache.namespaces = namespaces
	c.cache.namespacesLastFetch = time.Now()

	return namespaces, nil
}

// GetResources returns a list for the given resource in the given namespace. The resource is identified by the
// Kubernetes API path and the name of the resource.
func (c *Cluster) GetResources(ctx context.Context, namespace, path, resource, paramName, param string) ([]byte, error) {
	res, err := c.clientset.RESTClient().Get().AbsPath(path).Namespace(namespace).Resource(resource).Param(paramName, param).DoRaw(ctx)
	if err != nil {
		log.WithError(err).WithFields(logrus.Fields{"cluster": c.name, "namespace": namespace, "path": path, "resource": resource}).Errorf("GetResources")
		return nil, err
	}

	return res, nil
}

// GetLogs returns the logs for a Container. The Container is identified by the namespace and pod name and the container
// name. Is is also possible to set the time since when the logs should be received and with the previous flag the logs
// for the last container can be received.
func (c *Cluster) GetLogs(ctx context.Context, namespace, name, container string, since int64, previous bool) (string, error) {
	res, err := c.clientset.CoreV1().Pods(namespace).GetLogs(name, &corev1.PodLogOptions{
		Container:    container,
		SinceSeconds: &since,
		Previous:     previous,
	}).DoRaw(ctx)
	if err != nil {
		return "", err
	}

	return string(res), nil
}

// GetApplications returns a list of applications gor the given namespace. It also adds the cluster, namespace and
// application name to the Application CR, so that this information must not be specified by the user in the CR.
func (c *Cluster) GetApplications(ctx context.Context, namespace string) ([]application.ApplicationSpec, error) {
	applicationsList, err := c.applicationClientset.KobsV1beta1().Applications(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	var applications []application.ApplicationSpec

	for _, applicationItem := range applicationsList.Items {
		application := applicationItem.Spec
		application.Cluster = c.name
		application.Namespace = applicationItem.Namespace
		application.Name = applicationItem.Name

		applications = append(applications, application)
	}

	return applications, nil
}

// GetApplication returns a application for the given namespace and name. After the application is retrieved we replace,
// the cluster, namespace and name in the spec of the Application CR. This is needed, so that the user doesn't have to,
// provide these fields.
func (c *Cluster) GetApplication(ctx context.Context, namespace, name string) (*application.ApplicationSpec, error) {
	applicationCR, err := c.applicationClientset.KobsV1beta1().Applications(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, err
	}

	application := applicationCR.Spec
	application.Cluster = c.name
	application.Namespace = namespace
	application.Name = name

	return &application, nil
}

// GetTeams returns a list of teams gor the given namespace. It also adds the cluster, namespace and team name to the
// Team CR, so that this information must not be specified by the user in the CR.
func (c *Cluster) GetTeams(ctx context.Context, namespace string) ([]team.TeamSpec, error) {
	teamsList, err := c.teamClientset.KobsV1beta1().Teams(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	var teams []team.TeamSpec

	for _, teamItem := range teamsList.Items {
		team := teamItem.Spec
		team.Cluster = c.name
		team.Namespace = teamItem.Namespace
		team.Name = teamItem.Name

		teams = append(teams, team)
	}

	return teams, nil
}

// GetTeam returns a team for the given namespace and name. After the team is retrieved we replace, the cluster,
// namespace and name in the spec of the Team CR. This is needed, so that the user doesn't have to, provide these
// fields.
func (c *Cluster) GetTeam(ctx context.Context, namespace, name string) (*team.TeamSpec, error) {
	teamCR, err := c.teamClientset.KobsV1beta1().Teams(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, err
	}

	team := teamCR.Spec
	team.Cluster = c.name
	team.Namespace = namespace
	team.Name = name

	return &team, nil
}

// GetDashboards returns a list of dashboards gor the given namespace. It also adds the cluster, namespace and dashboard
// name to the Dashboard CR, so that this information must not be specified by the user in the CR.
func (c *Cluster) GetDashboards(ctx context.Context, namespace string) ([]dashboard.DashboardSpec, error) {
	dashboardsList, err := c.dashboardClientset.KobsV1beta1().Dashboards(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	var dashboards []dashboard.DashboardSpec

	for _, dashboardItem := range dashboardsList.Items {
		dashboard := dashboardItem.Spec
		dashboard.Cluster = c.name
		dashboard.Namespace = dashboardItem.Namespace
		dashboard.Name = dashboardItem.Name
		dashboard.Title = dashboardItem.Name

		dashboards = append(dashboards, dashboard)
	}

	return dashboards, nil
}

// GetDashboard returns a dashboard for the given namespace and name. After the dashboard is retrieved we replace,
// the cluster, namespace and name in the spec of the Dashboard CR. This is needed, so that the user doesn't have to,
// provide these fields.
func (c *Cluster) GetDashboard(ctx context.Context, namespace, name string) (*dashboard.DashboardSpec, error) {
	dashboardCR, err := c.dashboardClientset.KobsV1beta1().Dashboards(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, err
	}

	dashboard := dashboardCR.Spec
	dashboard.Cluster = c.name
	dashboard.Namespace = namespace
	dashboard.Name = name
	dashboard.Title = name

	return &dashboard, nil
}

// loadCRDs retrieves all CRDs from the Kubernetes API of this cluster. Then the CRDs are transformed into our internal
// CRD format and saved within the cluster. Since this function is only called once after a cluster was loaded, we call
// it in a endless loop until it succeeds.
func (c *Cluster) loadCRDs() {
	offset := 30

	for {
		log.WithFields(logrus.Fields{"name": c.name}).Tracef("loadCRDs")
		ctx := context.Background()

		res, err := c.clientset.RESTClient().Get().AbsPath("apis/apiextensions.k8s.io/v1/customresourcedefinitions").DoRaw(ctx)
		if err != nil {
			log.WithFields(logrus.Fields{"name": c.name}).WithError(err).Errorf("Could not get Custom Resource Definitions")
			time.Sleep(time.Duration(offset) * time.Second)
			offset = offset * 2
			continue
		}

		var crdList apiextensionsv1.CustomResourceDefinitionList

		err = json.Unmarshal(res, &crdList)
		if err != nil {
			log.WithFields(logrus.Fields{"name": c.name}).WithError(err).Errorf("Could not get unmarshal Custom Resource Definitions List")
			time.Sleep(time.Duration(offset) * time.Second)
			offset = offset * 2
			continue
		}

		for _, crd := range crdList.Items {
			for _, version := range crd.Spec.Versions {
				var description string
				if version.Schema != nil && version.Schema.OpenAPIV3Schema != nil {
					description = version.Schema.OpenAPIV3Schema.Description
				}

				var columns []CRDColumn
				if version.AdditionalPrinterColumns != nil {
					for _, column := range version.AdditionalPrinterColumns {
						columns = append(columns, CRDColumn{
							Description: column.Description,
							JSONPath:    column.JSONPath,
							Name:        column.Name,
							Type:        column.Type,
						})
					}
				}

				c.crds = append(c.crds, CRD{
					Path:        fmt.Sprintf("%s/%s", crd.Spec.Group, version.Name),
					Resource:    crd.Spec.Names.Plural,
					Title:       crd.Spec.Names.Kind,
					Description: description,
					Scope:       string(crd.Spec.Scope),
					Columns:     columns,
				})
			}
		}

		log.WithFields(logrus.Fields{"name": c.name, "count": len(c.crds)}).Debugf("CRDs were loaded.")
		break
	}
}

// NewCluster returns a new cluster. Each cluster must have a unique name and a client to make requests against the
// Kubernetes API server of this cluster. When a cluster was successfully created we call the loadCRDs function to get
// all CRDs for this cluster.
func NewCluster(name string, restConfig *rest.Config) (*Cluster, error) {
	clientset, err := kubernetes.NewForConfig(restConfig)
	if err != nil {
		log.WithError(err).Debugf("Could not create Kubernetes clientset.")
		return nil, err
	}

	applicationClientset, err := applicationClientsetVersioned.NewForConfig(restConfig)
	if err != nil {
		log.WithError(err).Debugf("Could not create application clientset.")
		return nil, err
	}

	teamClientset, err := teamClientsetVersioned.NewForConfig(restConfig)
	if err != nil {
		log.WithError(err).Debugf("Could not create team clientset.")
		return nil, err
	}

	dashboardClientset, err := dashboardClientsetVersioned.NewForConfig(restConfig)
	if err != nil {
		log.WithError(err).Debugf("Could not create team clientset.")
		return nil, err
	}

	name = strings.Trim(slugifyRe.ReplaceAllString(strings.ToLower(name), "-"), "-")

	c := &Cluster{
		clientset:            clientset,
		applicationClientset: applicationClientset,
		teamClientset:        teamClientset,
		dashboardClientset:   dashboardClientset,
		name:                 name,
	}

	go c.loadCRDs()

	return c, nil
}
