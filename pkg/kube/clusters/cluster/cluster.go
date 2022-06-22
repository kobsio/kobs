package cluster

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	applicationv1 "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	applicationClientsetVersioned "github.com/kobsio/kobs/pkg/kube/clients/application/clientset/versioned"
	dashboardClientsetVersioned "github.com/kobsio/kobs/pkg/kube/clients/dashboard/clientset/versioned"
	teamClientsetVersioned "github.com/kobsio/kobs/pkg/kube/clients/team/clientset/versioned"
	userClientsetVersioned "github.com/kobsio/kobs/pkg/kube/clients/user/clientset/versioned"
	"github.com/kobsio/kobs/pkg/kube/clusters/cluster/copy"
	"github.com/kobsio/kobs/pkg/kube/clusters/cluster/terminal"
	"github.com/kobsio/kobs/pkg/log"

	"github.com/gorilla/websocket"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
	corev1 "k8s.io/api/core/v1"
	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/remotecommand"
	controllerRuntimeClient "sigs.k8s.io/controller-runtime/pkg/client"
)

var (
	slugifyRe = regexp.MustCompile("[^a-z0-9]+")
)

// Client is the interface to interact with an Kubernetes cluster.
type Client interface {
	GetName() string
	GetCRDs() []CRD
	GetClient(ctx context.Context, schema *runtime.Scheme) (controllerRuntimeClient.Client, error)
	GetNamespaces(ctx context.Context) ([]string, error)
	GetResources(ctx context.Context, namespace, name, path, resource, paramName, param string) ([]byte, error)
	DeleteResource(ctx context.Context, namespace, name, path, resource string, body []byte) error
	PatchResource(ctx context.Context, namespace, name, path, resource string, body []byte) error
	CreateResource(ctx context.Context, namespace, name, path, resource, subResource string, body []byte) error
	GetLogs(ctx context.Context, namespace, name, container, regex string, since, tail int64, previous bool) (string, error)
	StreamLogs(ctx context.Context, conn *websocket.Conn, namespace, name, container string, since, tail int64, follow bool) error
	GetTerminal(ctx context.Context, conn *websocket.Conn, namespace, name, container, shell string) error
	CopyFileFromPod(ctx context.Context, w http.ResponseWriter, namespace, name, container, srcPath string) error
	CopyFileToPod(ctx context.Context, namespace, name, container string, srcFile multipart.File, destPath string) error
	GetApplications(ctx context.Context, namespace string) ([]applicationv1.ApplicationSpec, error)
	GetApplication(ctx context.Context, namespace, name string) (*applicationv1.ApplicationSpec, error)
	GetTeams(ctx context.Context, namespace string) ([]teamv1.TeamSpec, error)
	GetTeam(ctx context.Context, namespace, name string) (*teamv1.TeamSpec, error)
	GetDashboards(ctx context.Context, namespace string) ([]dashboardv1.DashboardSpec, error)
	GetDashboard(ctx context.Context, namespace, name string) (*dashboardv1.DashboardSpec, error)
	GetUsers(ctx context.Context, namespace string) ([]userv1.UserSpec, error)
	GetUser(ctx context.Context, namespace, name string) (*userv1.UserSpec, error)
	loadCRDs()
}

// client implements the Client interface. It contains all required fields and methods to interact with an Kubernetes
// cluster. The interfaces for the clientsets are implemented by the following types:
//   - kubernetes.Interface                    --> *kubernetes.Clientset
//   - applicationClientsetVersioned.Interface --> *applicationClientsetVersioned.Clientset
//   - teamClientsetVersioned.Interface        --> *teamClientsetVersioned.Clientset
//   - dashboardClientsetVersioned.Interface   --> *dashboardClientsetVersioned.Clientset
//   - userClientsetVersioned.Interface        --> *userClientsetVersioned.Clientset
type client struct {
	config               *rest.Config
	clientset            kubernetes.Interface
	applicationClientset applicationClientsetVersioned.Interface
	teamClientset        teamClientsetVersioned.Interface
	dashboardClientset   dashboardClientsetVersioned.Interface
	userClientset        userClientsetVersioned.Interface
	name                 string
	server               string
	crds                 []CRD
	tracer               trace.Tracer
}

// CRD is the format of a Custom Resource Definition. Each CRD must contain a path and resource, which are used for the
// API request to retrieve all CRs for a CRD. It also must contain a title (kind), an optional description, the scope of
// the CRs (namespaced vs. cluster) and an optional list of columns with the fields, which should be shown in the
// frontend table.
type CRD struct {
	ID          string      `json:"id"`
	Path        string      `json:"path"`
	Resource    string      `json:"resource"`
	Title       string      `json:"title"`
	Description string      `json:"description"`
	Scope       string      `json:"scope"`
	Columns     []CRDColumn `json:"columns,omitempty"`
	UpdatedAt   int64       `json:"updatedAt"`
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

// GetName returns the name of the cluster.
func (c *client) GetName() string {
	return c.name
}

// GetCRDs returns all CRDs of the cluster.
func (c *client) GetCRDs() []CRD {
	return c.crds
}

// GetClient returns a new client to perform CRUD operations on Kubernetes objects.
func (c *client) GetClient(ctx context.Context, schema *runtime.Scheme) (controllerRuntimeClient.Client, error) {
	_, span := c.tracer.Start(ctx, "cluster.GetClient")
	span.SetAttributes(attribute.Key("cluster").String(c.name))
	defer span.End()

	crc, err := controllerRuntimeClient.New(c.config, controllerRuntimeClient.Options{Scheme: schema})
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	return crc, nil
}

// GetNamespaces returns all namespaces for the cluster.
func (c *client) GetNamespaces(ctx context.Context) ([]string, error) {
	ctx, span := c.tracer.Start(ctx, "cluster.GetNamespaces")
	span.SetAttributes(attribute.Key("cluster").String(c.name))
	defer span.End()

	namespaceList, err := c.clientset.CoreV1().Namespaces().List(ctx, metav1.ListOptions{})
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	var namespaces []string

	for _, namespace := range namespaceList.Items {
		namespaces = append(namespaces, namespace.ObjectMeta.Name)
	}

	return namespaces, nil
}

// GetResources returns a list for the given resource in the given namespace. The resource is identified by the
// Kubernetes API path and the resource. The name is optional and can be used to get a single resource, instead of a
// list of resources.
func (c *client) GetResources(ctx context.Context, namespace, name, path, resource, paramName, param string) ([]byte, error) {
	ctx, span := c.tracer.Start(ctx, "cluster.GetResources")
	span.SetAttributes(attribute.Key("cluster").String(c.name))
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	span.SetAttributes(attribute.Key("name").String(name))
	span.SetAttributes(attribute.Key("path").String(path))
	span.SetAttributes(attribute.Key("resource").String(resource))
	span.SetAttributes(attribute.Key("paramName").String(paramName))
	span.SetAttributes(attribute.Key("param").String(param))
	defer span.End()

	if name != "" {
		if namespace != "" {
			res, err := c.clientset.CoreV1().RESTClient().Get().AbsPath(path).Namespace(namespace).Resource(resource).Name(name).DoRaw(ctx)
			if err != nil {
				log.Error(ctx, "Could not get resources", zap.Error(err), zap.String("cluster", c.name), zap.String("namespace", namespace), zap.String("name", name), zap.String("path", path), zap.String("resource", resource))
				span.RecordError(err)
				span.SetStatus(codes.Error, err.Error())
				return nil, err
			}

			return res, nil
		}

		res, err := c.clientset.CoreV1().RESTClient().Get().AbsPath(path).Resource(resource).Name(name).DoRaw(ctx)
		if err != nil {
			log.Error(ctx, "Could not get resources", zap.Error(err), zap.String("cluster", c.name), zap.String("name", name), zap.String("path", path), zap.String("resource", resource))
			span.RecordError(err)
			span.SetStatus(codes.Error, err.Error())
			return nil, err
		}

		return res, nil
	}

	res, err := c.clientset.CoreV1().RESTClient().Get().AbsPath(path).Namespace(namespace).Resource(resource).Param(paramName, param).DoRaw(ctx)
	if err != nil {
		log.Error(ctx, "Could not get resources", zap.Error(err), zap.String("cluster", c.name), zap.String("namespace", namespace), zap.String("path", path), zap.String("resource", resource))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	return res, nil
}

// DeleteResource can be used to delete the given resource. The resource is identified by the Kubernetes API path and
// the name of the resource.
func (c *client) DeleteResource(ctx context.Context, namespace, name, path, resource string, body []byte) error {
	ctx, span := c.tracer.Start(ctx, "cluster.DeleteResource")
	span.SetAttributes(attribute.Key("cluster").String(c.name))
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	span.SetAttributes(attribute.Key("name").String(name))
	span.SetAttributes(attribute.Key("path").String(path))
	span.SetAttributes(attribute.Key("resource").String(resource))
	defer span.End()

	_, err := c.clientset.CoreV1().RESTClient().Delete().AbsPath(path).Namespace(namespace).Resource(resource).Name(name).Body(body).DoRaw(ctx)
	if err != nil {
		log.Error(ctx, "Could not delete resources", zap.Error(err), zap.String("cluster", c.name), zap.String("namespace", namespace), zap.String("path", path), zap.String("resource", resource))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	return nil
}

// PatchResource can be used to edit the given resource. The resource is identified by the Kubernetes API path and the
// name of the resource.
func (c *client) PatchResource(ctx context.Context, namespace, name, path, resource string, body []byte) error {
	ctx, span := c.tracer.Start(ctx, "cluster.PatchResource")
	span.SetAttributes(attribute.Key("cluster").String(c.name))
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	span.SetAttributes(attribute.Key("name").String(name))
	span.SetAttributes(attribute.Key("path").String(path))
	span.SetAttributes(attribute.Key("resource").String(resource))
	defer span.End()

	_, err := c.clientset.CoreV1().RESTClient().Patch(types.JSONPatchType).AbsPath(path).Namespace(namespace).Resource(resource).Name(name).Body(body).DoRaw(ctx)
	if err != nil {
		log.Error(ctx, "Could not patch resources", zap.Error(err), zap.String("cluster", c.name), zap.String("namespace", namespace), zap.String("path", path), zap.String("resource", resource))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	return nil
}

// CreateResource can be used to create the given resource. The resource is identified by the Kubernetes API path and the
// name of the resource.
func (c *client) CreateResource(ctx context.Context, namespace, name, path, resource, subResource string, body []byte) error {
	ctx, span := c.tracer.Start(ctx, "cluster.CreateResource")
	span.SetAttributes(attribute.Key("cluster").String(c.name))
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	span.SetAttributes(attribute.Key("name").String(name))
	span.SetAttributes(attribute.Key("path").String(path))
	span.SetAttributes(attribute.Key("resource").String(resource))
	span.SetAttributes(attribute.Key("subResource").String(subResource))
	defer span.End()

	if name != "" && subResource != "" {
		_, err := c.clientset.CoreV1().RESTClient().Put().AbsPath(path).Namespace(namespace).Name(name).Resource(resource).SubResource(subResource).Body(body).DoRaw(ctx)
		if err != nil {
			log.Error(ctx, "Could not create resources", zap.Error(err), zap.String("cluster", c.name), zap.String("namespace", namespace), zap.String("name", name), zap.String("path", path), zap.String("resource", resource), zap.String("subResource", subResource))
			span.RecordError(err)
			span.SetStatus(codes.Error, err.Error())
			return err
		}

		return nil
	}

	_, err := c.clientset.CoreV1().RESTClient().Post().AbsPath(path).Namespace(namespace).Resource(resource).SubResource(subResource).Body(body).DoRaw(ctx)
	if err != nil {
		log.Error(ctx, "Could not create resources", zap.Error(err), zap.String("cluster", c.name), zap.String("namespace", namespace), zap.String("path", path), zap.String("resource", resource))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	return nil
}

// GetLogs returns the logs for a Container. The Container is identified by the namespace and pod name and the container
// name. Is is also possible to set the time since when the logs should be received and with the previous flag the logs
// for the last container can be received.
func (c *client) GetLogs(ctx context.Context, namespace, name, container, regex string, since, tail int64, previous bool) (string, error) {
	ctx, span := c.tracer.Start(ctx, "cluster.DeleteResource")
	span.SetAttributes(attribute.Key("cluster").String(c.name))
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	span.SetAttributes(attribute.Key("name").String(name))
	span.SetAttributes(attribute.Key("container").String(container))
	span.SetAttributes(attribute.Key("regex").String(regex))
	span.SetAttributes(attribute.Key("since").Int64(since))
	span.SetAttributes(attribute.Key("tail").Int64(tail))
	span.SetAttributes(attribute.Key("previous").Bool(previous))
	defer span.End()

	options := &corev1.PodLogOptions{
		Container:    container,
		SinceSeconds: &since,
		Previous:     previous,
	}

	if tail > 0 {
		options.TailLines = &tail
	}

	res, err := c.clientset.CoreV1().Pods(namespace).GetLogs(name, options).DoRaw(ctx)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return "", err
	}

	if regex == "" {
		var logs []string
		for _, line := range strings.Split(string(res), "\n") {
			logs = append(logs, line)
		}

		return strings.Join(logs, "\n\r") + "\n\r", nil
	}

	reg, err := regexp.Compile(regex)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return "", err
	}

	var logs []string
	for _, line := range strings.Split(string(res), "\n") {
		if reg.MatchString(line) {
			logs = append(logs, line)
		}
	}

	return strings.Join(logs, "\n\r") + "\n\r", nil
}

// StreamLogs can be used to stream the logs of the selected Container. For that we are using the passed in WebSocket
// connection an write each line returned by the Kubernetes API to this connection.
func (c *client) StreamLogs(ctx context.Context, conn *websocket.Conn, namespace, name, container string, since, tail int64, follow bool) error {
	ctx, span := c.tracer.Start(ctx, "cluster.StreamLogs")
	span.SetAttributes(attribute.Key("cluster").String(c.name))
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	span.SetAttributes(attribute.Key("name").String(name))
	span.SetAttributes(attribute.Key("container").String(container))
	span.SetAttributes(attribute.Key("since").Int64(since))
	span.SetAttributes(attribute.Key("tail").Int64(tail))
	span.SetAttributes(attribute.Key("follow").Bool(follow))
	defer span.End()

	options := &corev1.PodLogOptions{
		Container:    container,
		SinceSeconds: &since,
		Follow:       follow,
	}

	if tail > 0 {
		options.TailLines = &tail
	}

	stream, err := c.clientset.CoreV1().Pods(namespace).GetLogs(name, options).Stream(ctx)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	defer stream.Close()
	reader := bufio.NewReaderSize(stream, 16)
	lastLine := ""

	for {
		data, isPrefix, err := reader.ReadLine()
		if err != nil {
			span.RecordError(err)
			span.SetStatus(codes.Error, err.Error())
			return err
		}

		lines := strings.Split(string(data), "\r")
		length := len(lines)

		if len(lastLine) > 0 {
			lines[0] = lastLine + lines[0]
			lastLine = ""
		}

		if isPrefix {
			lastLine = lines[length-1]
			lines = lines[:(length - 1)]
		}

		for _, line := range lines {
			if err := conn.WriteMessage(websocket.TextMessage, []byte(line)); err != nil {
				span.RecordError(err)
				span.SetStatus(codes.Error, err.Error())
				return err
			}
		}
	}
}

// GetTerminal starts a new terminal session via the given WebSocket connection.
func (c *client) GetTerminal(ctx context.Context, conn *websocket.Conn, namespace, name, container, shell string) error {
	ctx, span := c.tracer.Start(ctx, "cluster.GetTerminal")
	span.SetAttributes(attribute.Key("cluster").String(c.name))
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	span.SetAttributes(attribute.Key("name").String(name))
	span.SetAttributes(attribute.Key("container").String(container))
	span.SetAttributes(attribute.Key("shell").String(shell))
	defer span.End()

	reqURL, err := url.Parse(fmt.Sprintf("%s/api/v1/namespaces/%s/pods/%s/exec?container=%s&command=%s&stdin=true&stdout=true&stderr=true&tty=true", c.config.Host, namespace, name, container, shell))
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	if !terminal.IsValidShell(shell) {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return fmt.Errorf("invalid shell %s", shell)
	}

	session := &terminal.Session{
		WebSocket: conn,
		SizeChan:  make(chan remotecommand.TerminalSize),
	}

	cmd := []string{shell}
	return terminal.StartProcess(c.config, reqURL, cmd, session)
}

// CopyFileFromPod creates the request URL for downloading a file from the specified container.
func (c *client) CopyFileFromPod(ctx context.Context, w http.ResponseWriter, namespace, name, container, srcPath string) error {
	ctx, span := c.tracer.Start(ctx, "cluster.CopyFileFromPod")
	span.SetAttributes(attribute.Key("cluster").String(c.name))
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	span.SetAttributes(attribute.Key("name").String(name))
	span.SetAttributes(attribute.Key("container").String(container))
	span.SetAttributes(attribute.Key("srcPath").String(srcPath))
	defer span.End()

	command := fmt.Sprintf("&command=tar&command=cf&command=-&command=%s", srcPath)
	reqURL, err := url.Parse(fmt.Sprintf("%s/api/v1/namespaces/%s/pods/%s/exec?container=%s&stdin=true&stdout=true&stderr=true&tty=false%s", c.config.Host, namespace, name, container, command))
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	return copy.FileFromPod(w, c.config, reqURL)
}

// CopyFileToPod creates the request URL for uploading a file to the specified container.
func (c *client) CopyFileToPod(ctx context.Context, namespace, name, container string, srcFile multipart.File, destPath string) error {
	ctx, span := c.tracer.Start(ctx, "cluster.CopyFileToPod")
	span.SetAttributes(attribute.Key("cluster").String(c.name))
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	span.SetAttributes(attribute.Key("name").String(name))
	span.SetAttributes(attribute.Key("container").String(container))
	span.SetAttributes(attribute.Key("destPath").String(destPath))
	defer span.End()

	command := fmt.Sprintf("&command=cp&command=/dev/stdin&command=%s", destPath)
	reqURL, err := url.Parse(fmt.Sprintf("%s/api/v1/namespaces/%s/pods/%s/exec?container=%s&stdin=true&stdout=true&stderr=true&tty=false%s", c.config.Host, namespace, name, container, command))
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	return copy.FileToPod(c.config, reqURL, srcFile, destPath)
}

// GetApplications returns a list of applications gor the given namespace. It also adds the cluster, namespace and
// application name to the Application CR, so that this information must not be specified by the user in the CR.
func (c *client) GetApplications(ctx context.Context, namespace string) ([]applicationv1.ApplicationSpec, error) {
	ctx, span := c.tracer.Start(ctx, "cluster.GetApplications")
	span.SetAttributes(attribute.Key("cluster").String(c.name))
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	defer span.End()

	applicationsList, err := c.applicationClientset.KobsV1().Applications(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	var applications []applicationv1.ApplicationSpec

	for _, applicationItem := range applicationsList.Items {
		application := setApplicationDefaults(applicationItem.Spec, c.name, applicationItem.Namespace, applicationItem.Name)
		applications = append(applications, application)
	}

	return applications, nil
}

// GetApplication returns a application for the given namespace and name. After the application is retrieved we replace,
// the cluster, namespace and name in the spec of the Application CR. This is needed, so that the user doesn't have to,
// provide these fields.
func (c *client) GetApplication(ctx context.Context, namespace, name string) (*applicationv1.ApplicationSpec, error) {
	ctx, span := c.tracer.Start(ctx, "cluster.GetApplication")
	span.SetAttributes(attribute.Key("cluster").String(c.name))
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	span.SetAttributes(attribute.Key("name").String(name))
	defer span.End()

	applicationItem, err := c.applicationClientset.KobsV1().Applications(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	application := setApplicationDefaults(applicationItem.Spec, c.name, namespace, name)
	return &application, nil
}

// GetTeams returns a list of teams gor the given namespace. It also adds the cluster, namespace and team name to the
// Team CR, so that this information must not be specified by the user in the CR.
func (c *client) GetTeams(ctx context.Context, namespace string) ([]teamv1.TeamSpec, error) {
	ctx, span := c.tracer.Start(ctx, "cluster.GetTeams")
	span.SetAttributes(attribute.Key("cluster").String(c.name))
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	defer span.End()

	teamsList, err := c.teamClientset.KobsV1().Teams(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	var teams []teamv1.TeamSpec

	for _, teamItem := range teamsList.Items {
		team := setTeamDefaults(teamItem.Spec, c.name, teamItem.Namespace, teamItem.Name)
		teams = append(teams, team)
	}

	return teams, nil
}

// GetTeam returns a team for the given namespace and name. After the team is retrieved we replace, the cluster,
// namespace and name in the spec of the Team CR. This is needed, so that the user doesn't have to, provide these
// fields.
func (c *client) GetTeam(ctx context.Context, namespace, name string) (*teamv1.TeamSpec, error) {
	ctx, span := c.tracer.Start(ctx, "cluster.GetTeam")
	span.SetAttributes(attribute.Key("cluster").String(c.name))
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	span.SetAttributes(attribute.Key("name").String(name))
	defer span.End()

	teamItem, err := c.teamClientset.KobsV1().Teams(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	team := setTeamDefaults(teamItem.Spec, c.name, namespace, name)
	return &team, nil
}

// GetDashboards returns a list of dashboards gor the given namespace. It also adds the cluster, namespace and dashboard
// name to the Dashboard CR, so that this information must not be specified by the user in the CR.
func (c *client) GetDashboards(ctx context.Context, namespace string) ([]dashboardv1.DashboardSpec, error) {
	ctx, span := c.tracer.Start(ctx, "cluster.GetDashboards")
	span.SetAttributes(attribute.Key("cluster").String(c.name))
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	defer span.End()

	dashboardsList, err := c.dashboardClientset.KobsV1().Dashboards(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	var dashboards []dashboardv1.DashboardSpec

	for _, dashboardItem := range dashboardsList.Items {
		dashboard := setDashboardDefaults(dashboardItem.Spec, c.name, dashboardItem.Namespace, dashboardItem.Name)
		dashboards = append(dashboards, dashboard)
	}

	return dashboards, nil
}

// GetDashboard returns a dashboard for the given namespace and name. After the dashboard is retrieved we replace,
// the cluster, namespace and name in the spec of the Dashboard CR. This is needed, so that the user doesn't have to,
// provide these fields.
func (c *client) GetDashboard(ctx context.Context, namespace, name string) (*dashboardv1.DashboardSpec, error) {
	ctx, span := c.tracer.Start(ctx, "cluster.GetDashboard")
	span.SetAttributes(attribute.Key("cluster").String(c.name))
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	span.SetAttributes(attribute.Key("name").String(name))
	defer span.End()

	dashboardItem, err := c.dashboardClientset.KobsV1().Dashboards(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	dashboard := setDashboardDefaults(dashboardItem.Spec, c.name, namespace, name)
	return &dashboard, nil
}

// GetUsers returns a list of users for the given namespace. It also adds the cluster, namespace and user name to the
// User CR, so that this information must not be specified by the user in the CR.
func (c *client) GetUsers(ctx context.Context, namespace string) ([]userv1.UserSpec, error) {
	ctx, span := c.tracer.Start(ctx, "cluster.GetUsers")
	span.SetAttributes(attribute.Key("cluster").String(c.name))
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	defer span.End()

	usersList, err := c.userClientset.KobsV1().Users(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	var users []userv1.UserSpec

	for _, userItem := range usersList.Items {
		user := setUserDefaults(userItem.Spec, c.name, userItem.Namespace, userItem.Name)
		users = append(users, user)
	}

	return users, nil
}

// GetUser returns a user for the given namespace and name. After the user is retrieved we replace, the cluster,
// namespace and name in the spec of the User CR. This is needed, so that the user doesn't have to, provide these
// fields.
func (c *client) GetUser(ctx context.Context, namespace, name string) (*userv1.UserSpec, error) {
	ctx, span := c.tracer.Start(ctx, "cluster.GetUser")
	span.SetAttributes(attribute.Key("cluster").String(c.name))
	span.SetAttributes(attribute.Key("namespace").String(namespace))
	span.SetAttributes(attribute.Key("name").String(name))
	defer span.End()

	userItem, err := c.userClientset.KobsV1().Users(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	user := setUserDefaults(userItem.Spec, c.name, namespace, name)
	return &user, nil
}

// loadCRDs retrieves all CRDs from the Kubernetes API of this cluster. Then the CRDs are transformed into our internal
// CRD format and saved within the cluster. Since this function is only called once after a cluster was loaded, we call
// it in a endless loop until it succeeds.
func (c *client) loadCRDs() {
	ctx, span := c.tracer.Start(context.Background(), "cluster.loadCRDs")
	span.SetAttributes(attribute.Key("cluster").String(c.name))
	defer span.End()

	offset := 30

	for {
		log.Debug(ctx, "Load CRDs")

		res, err := c.clientset.CoreV1().RESTClient().Get().AbsPath("apis/apiextensions.k8s.io/v1/customresourcedefinitions").DoRaw(ctx)
		if err != nil {
			log.Error(ctx, "Could not get Custom Resource Definitions", zap.Error(err), zap.String("name", c.name))
			span.RecordError(err)
			span.SetStatus(codes.Error, err.Error())
			time.Sleep(time.Duration(offset) * time.Second)
			offset = offset * 2
			continue
		}

		var crdList apiextensionsv1.CustomResourceDefinitionList

		err = json.Unmarshal(res, &crdList)
		if err != nil {
			log.Error(ctx, "Could not get unmarshal Custom Resource Definitions List", zap.Error(err), zap.String("name", c.name))
			span.RecordError(err)
			span.SetStatus(codes.Error, err.Error())
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
					ID:          fmt.Sprintf("%s.%s/%s", crd.Spec.Names.Plural, crd.Spec.Group, version.Name),
					Path:        fmt.Sprintf("/apis/%s/%s", crd.Spec.Group, version.Name),
					Resource:    crd.Spec.Names.Plural,
					Title:       crd.Spec.Names.Kind,
					Description: description,
					Scope:       string(crd.Spec.Scope),
					Columns:     columns,
				})
			}
		}

		log.Debug(ctx, "CRDs were loaded", zap.String("name", c.name), zap.Int("crdsCount", len(c.crds)))
		break
	}
}

// NewClient returns a new client to interact with a Kubernetes cluster. Each cluster must have a unique name and the
// actual Kubernetes clients to make requests against the Kubernetes API server. When a client was successfully created
// we call the loadCRDs function to get all CRDs in the Kubernetes cluster.
func NewClient(name, server string, restConfig *rest.Config) (Client, error) {
	clientset, err := kubernetes.NewForConfig(restConfig)
	if err != nil {
		log.Error(nil, "Could not create Kubernetes clientset", zap.Error(err))
		return nil, err
	}

	applicationClientset, err := applicationClientsetVersioned.NewForConfig(restConfig)
	if err != nil {
		log.Error(nil, "Could not create application clientset", zap.Error(err))
		return nil, err
	}

	teamClientset, err := teamClientsetVersioned.NewForConfig(restConfig)
	if err != nil {
		log.Error(nil, "Could not create team clientset", zap.Error(err))
		return nil, err
	}

	dashboardClientset, err := dashboardClientsetVersioned.NewForConfig(restConfig)
	if err != nil {
		log.Error(nil, "Could not create dashboard clientset", zap.Error(err))
		return nil, err
	}

	userClientset, err := userClientsetVersioned.NewForConfig(restConfig)
	if err != nil {
		log.Error(nil, "Could not create user clientset", zap.Error(err))
		return nil, err
	}

	name = strings.Trim(slugifyRe.ReplaceAllString(strings.ToLower(name), "-"), "-")

	c := &client{
		config:               restConfig,
		clientset:            clientset,
		applicationClientset: applicationClientset,
		teamClientset:        teamClientset,
		dashboardClientset:   dashboardClientset,
		userClientset:        userClientset,
		name:                 name,
		server:               server,
		tracer:               otel.Tracer("cluster"),
	}

	go c.loadCRDs()

	return c, nil
}
