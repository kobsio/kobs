package cluster

import (
	"context"
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
	"time"

	applicationClientsetVersioned "github.com/kobsio/kobs/pkg/api/plugins/application/clientset/versioned"
	applicationProto "github.com/kobsio/kobs/pkg/api/plugins/application/proto"
	clustersProto "github.com/kobsio/kobs/pkg/api/plugins/clusters/proto"

	"github.com/sirupsen/logrus"
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
	options              Options
	name                 string
	crds                 []*clustersProto.CRD
}

// Options contains various options, which could be set for a cluster. For example a user can set the cache duration for
// loaded manifest files and the names of the datasources, which should be used within a cluster.
type Options struct {
	cacheDuration time.Duration
}

// Cache implements a simple caching layer, for the loaded manifest files. The goal of the caching layer is to return
// the manifests faster to the user.
type Cache struct {
	namespaces          []string
	namespacesLastFetch time.Time
}

// SetOptions is used to set the options for a cluster. The options are not set during the creation of a cluster, so
// that we do not have to pass around the options through different functions.
// We also do not know the datasources befor the cluster name is determined, so that we loop through all loaded clusters
// and connect the datasource names with the correct cluster.
func (c *Cluster) SetOptions(cacheDuration time.Duration) {
	c.options = Options{
		cacheDuration: cacheDuration,
	}
}

// GetName returns the name of the cluster.
func (c *Cluster) GetName() string {
	return c.name
}

// GetCRDs returns all CRDs of the cluster.
func (c *Cluster) GetCRDs() []*clustersProto.CRD {
	return c.crds
}

// GetNamespaces returns all namespaces for the cluster. To reduce the latency and the number of API calls, we are
// "caching" the namespaces. This means that if a new namespace is created in a cluster, this namespaces is only shown
// after the configured cache duration.
func (c *Cluster) GetNamespaces(ctx context.Context) ([]string, error) {
	log.WithFields(logrus.Fields{"last fetch": c.cache.namespacesLastFetch}).Tracef("Last namespace fetch.")

	if c.cache.namespacesLastFetch.After(time.Now().Add(-1 * c.options.cacheDuration)) {
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
func (c *Cluster) GetResources(ctx context.Context, namespace, path, resource, paramName, param string) (string, error) {
	res, err := c.clientset.RESTClient().Get().AbsPath(path).Namespace(namespace).Resource(resource).Param(paramName, param).DoRaw(ctx)
	if err != nil {
		log.WithError(err).WithFields(logrus.Fields{"cluster": c.name, "namespace": namespace, "path": path, "resource": resource}).Errorf("GetResources")
		return "", err
	}

	return string(res), nil
}

// GetApplications returns a list of applications gor the given namespace. It also adds the cluster, namespace and
// application name to the application CR, so that this information must not be specified by the user in the CR.
func (c *Cluster) GetApplications(ctx context.Context, namespace string) ([]*applicationProto.Application, error) {
	applicationsList, err := c.applicationClientset.KobsV1alpha1().Applications(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	var applications []*applicationProto.Application

	for _, app := range applicationsList.Items {
		if app.Spec == nil {
			continue
		}

		application := app.Spec
		application.Cluster = c.name
		application.Namespace = app.Namespace
		application.Name = app.Name

		applications = append(applications, application)
	}

	return applications, nil
}

// GetApplication returns a application for the given namespace and name. After the application is retrieved we replace,
// the cluster, namespace and name in the spec of the Application CR. This is needed, so that the user doesn't have to,
// provide these fields.
func (c *Cluster) GetApplication(ctx context.Context, namespace, name string) (*applicationProto.Application, error) {
	applicationCR, err := c.applicationClientset.KobsV1alpha1().Applications(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, err
	}

	application := applicationCR.Spec
	application.Cluster = c.name
	application.Namespace = namespace
	application.Name = name

	return application, nil
}

// loadCRDs retrieves all CRDs from the Kubernetes API of this cluster. Then the CRDs are transformed into our internal
// CRD format and saved within the cluster. Since this function is only called once after a cluster was loaded, we call
// it in a endless loop until it succeeds.
func (c *Cluster) loadCRDs() {
	for {
		log.WithFields(logrus.Fields{"name": c.name}).Tracef("loadCRDs")
		ctx := context.Background()

		res, err := c.clientset.RESTClient().Get().AbsPath("apis/apiextensions.k8s.io/v1/customresourcedefinitions").DoRaw(ctx)
		if err != nil {
			log.WithFields(logrus.Fields{"name": c.name}).WithError(err).Errorf("Could not get Custom Resource Definitions")
			time.Sleep(60 * time.Second)
			continue
		}

		var crdList apiextensionsv1.CustomResourceDefinitionList

		err = json.Unmarshal(res, &crdList)
		if err != nil {
			log.WithFields(logrus.Fields{"name": c.name}).WithError(err).Errorf("Could not get unmarshal Custom Resource Definitions List")
			time.Sleep(60 * time.Second)
			continue
		}

		for _, crd := range crdList.Items {
			if len(crd.Spec.Versions) > 0 {
				var description string
				if crd.Spec.Versions[0].Schema != nil && crd.Spec.Versions[0].Schema.OpenAPIV3Schema != nil {
					description = crd.Spec.Versions[0].Schema.OpenAPIV3Schema.Description
				}

				var columns []*clustersProto.CRDColumn
				if crd.Spec.Versions[0].AdditionalPrinterColumns != nil {
					for _, column := range crd.Spec.Versions[0].AdditionalPrinterColumns {
						columns = append(columns, &clustersProto.CRDColumn{
							Description: column.Description,
							JsonPath:    column.JSONPath,
							Name:        column.Name,
							Type:        column.Type,
						})
					}
				}

				c.crds = append(c.crds, &clustersProto.CRD{
					Path:        fmt.Sprintf("%s/%s", crd.Spec.Group, crd.Spec.Versions[0].Name),
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

	name = strings.Trim(slugifyRe.ReplaceAllString(strings.ToLower(name), "-"), "-")

	c := &Cluster{
		clientset:            clientset,
		applicationClientset: applicationClientset,
		name:                 name,
	}

	go c.loadCRDs()

	return c, nil
}
