package clusters

import (
	"context"
	"fmt"
	"os"
	"sort"
	"strings"
	"time"

	applicationProto "github.com/kobsio/kobs/pkg/api/plugins/application/proto"
	"github.com/kobsio/kobs/pkg/api/plugins/clusters/cluster"
	clustersProto "github.com/kobsio/kobs/pkg/api/plugins/clusters/proto"
	"github.com/kobsio/kobs/pkg/api/plugins/clusters/provider"
	teamProto "github.com/kobsio/kobs/pkg/api/plugins/team/proto"
	templateProto "github.com/kobsio/kobs/pkg/api/plugins/template/proto"

	"github.com/sirupsen/logrus"
	flag "github.com/spf13/pflag"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

var (
	log                     = logrus.WithFields(logrus.Fields{"package": "clusters"})
	cacheDurationNamespaces string
	cacheDurationTopology   string
	cacheDurationTeams      string
	cacheDurationTemplates  time.Duration
	forbiddenResources      []string
)

// init is used to define all command-line flags for the clusters package.
func init() {
	defaultCacheDurationNamespaces := "5m"
	if os.Getenv("KOBS_CLUSTERS_CACHE_DURATION_NAMESPACES") != "" {
		defaultCacheDurationNamespaces = os.Getenv("KOBS_CLUSTERS_CACHE_DURATION_NAMESPACES")
	}

	defaultCacheDurationTopology := "60m"
	if os.Getenv("KOBS_CLUSTERS_CACHE_DURATION_TOPOLOGY") != "" {
		defaultCacheDurationTopology = os.Getenv("KOBS_CLUSTERS_CACHE_DURATION_TOPOLOGY")
	}

	defaultCacheDurationTeams := "60m"
	if os.Getenv("KOBS_CLUSTERS_CACHE_DURATION_TEAMS") != "" {
		defaultCacheDurationTeams = os.Getenv("KOBS_CLUSTERS_CACHE_DURATION_TEAMS")
	}

	defaultCacheDurationTemplates := time.Duration(60 * time.Minute)
	if os.Getenv("KOBS_CLUSTERS_CACHE_DURATION_TEMPLATES") != "" {
		parsedCacheDurationTemplates, err := time.ParseDuration(os.Getenv("KOBS_CLUSTERS_CACHE_DURATION_TEMPLATES"))
		if err == nil {
			defaultCacheDurationTemplates = parsedCacheDurationTemplates
		}
	}

	var defaultForbiddenResources []string
	if os.Getenv("KOBS_CLUSTERS_FORBIDDEN_RESOURCES") != "" {
		defaultForbiddenResources = strings.Split(os.Getenv("KOBS_CLUSTERS_FORBIDDEN_RESOURCES"), ",")
	}

	flag.StringVar(&cacheDurationNamespaces, "clusters.cache-duration.namespaces", defaultCacheDurationNamespaces, "The duration, for how long requests to get the list of namespaces should be cached.")
	flag.StringVar(&cacheDurationTopology, "clusters.cache-duration.topology", defaultCacheDurationTopology, "The duration, for how long the topology data should be cached.")
	flag.StringVar(&cacheDurationTeams, "clusters.cache-duration.teams", defaultCacheDurationTeams, "The duration, for how long the teams data should be cached.")
	flag.DurationVar(&cacheDurationTemplates, "clusters.cache-duration.templates", defaultCacheDurationTemplates, "The duration, for how long the templates data should be cached.")
	flag.StringArrayVar(&forbiddenResources, "clusters.forbidden-resources", defaultForbiddenResources, "A list of resources, which can not be accessed via kobs.")
}

// isForbidden checks if the requested resource was specified in the forbidden resources list.
func isForbidden(resource string) bool {
	for _, r := range forbiddenResources {
		if resource == r {
			return true
		}
	}

	return false
}

// Config is the configuration required to load all clusters.
type Config struct {
	Providers []provider.Config `yaml:"providers"`
}

// Clusters contains all fields and methods to interact with the configured Kubernetes clusters. It must implement the
// Clusters service from the protocol buffers definition.
type Clusters struct {
	clustersProto.UnimplementedClustersServer
	clusters []*cluster.Cluster
	edges    []*clustersProto.Edge
	nodes    []*clustersProto.Node
	teams    []Team
	cache    Cache
}

type Cache struct {
	templates          []*templateProto.Template
	templatesLastFetch time.Time
}

func (c *Clusters) getCluster(name string) *cluster.Cluster {
	for _, cl := range c.clusters {
		if cl.GetName() == name {
			return cl
		}
	}

	return nil
}

// GetClusters returns all loaded Kubernetes clusters.
// We are not returning the complete cluster structure. Instead we are returning just the names of the clusters. We are
// also sorting the clusters alphabetically, to improve the user experience in the frontend.
// NOTE: Maybe we can also save the cluster names slice, since the name of a cluster couldn't change during runtime.
func (c *Clusters) GetClusters(ctx context.Context, getClustersRequest *clustersProto.GetClustersRequest) (*clustersProto.GetClustersResponse, error) {
	log.Tracef("GetClusters")

	var clusters []string

	for _, cluster := range c.clusters {
		clusters = append(clusters, cluster.GetName())
	}

	sort.Slice(clusters, func(i, j int) bool {
		return clusters[i] < clusters[j]
	})

	log.WithFields(logrus.Fields{"clusters": clusters}).Tracef("GetClusters")

	return &clustersProto.GetClustersResponse{
		Clusters: clusters,
	}, nil
}

// GetNamespaces returns all namespaces for the given clusters.
// As we did it for the clusters, we are also just returning the names of all namespaces. After we retrieved all
// namespaces we have to depulicate them, so that our frontend logic can handle them properly. We are also sorting the
// namespaces alphabetically.
func (c *Clusters) GetNamespaces(ctx context.Context, getNamespacesRequest *clustersProto.GetNamespacesRequest) (*clustersProto.GetNamespacesResponse, error) {
	log.WithFields(logrus.Fields{"clusters": getNamespacesRequest.Clusters}).Tracef("GetNamespaces")

	var namespaces []string

	for _, clusterName := range getNamespacesRequest.Clusters {
		cluster := c.getCluster(clusterName)
		if cluster == nil {
			return nil, fmt.Errorf("invalid cluster name")
		}

		clusterNamespaces, err := cluster.GetNamespaces(ctx)
		if err != nil {
			return nil, err
		}

		if clusterNamespaces != nil {
			namespaces = append(namespaces, clusterNamespaces...)
		}

	}

	keys := make(map[string]bool)
	uniqueNamespaces := []string{}
	for _, namespace := range namespaces {
		if _, value := keys[namespace]; !value {
			keys[namespace] = true
			uniqueNamespaces = append(uniqueNamespaces, namespace)
		}
	}

	sort.Slice(uniqueNamespaces, func(i, j int) bool {
		return uniqueNamespaces[i] < uniqueNamespaces[j]
	})

	log.WithFields(logrus.Fields{"namespaces": uniqueNamespaces}).Tracef("GetNamespaces")

	return &clustersProto.GetNamespacesResponse{
		Namespaces: uniqueNamespaces,
	}, nil
}

// GetCRDs returns all CRDs for all clusters.
// Instead of only returning the CRDs for a list of specified clusters, we return all CRDs, so that we only have to call
// this function once from the React app. The CRDs form all loaded clusters are merged and then deduplicated.
func (c *Clusters) GetCRDs(ctx context.Context, getCRDsRequest *clustersProto.GetCRDsRequest) (*clustersProto.GetCRDsResponse, error) {
	log.Tracef("GetCRDs")
	var crds []*clustersProto.CRD

	for _, cluster := range c.clusters {
		crds = append(crds, cluster.GetCRDs()...)
	}

	keys := make(map[string]bool)
	uniqueCRDs := []*clustersProto.CRD{}
	for _, crd := range crds {
		if _, value := keys[crd.Resource+"."+crd.Path]; !value {
			keys[crd.Resource+"."+crd.Path] = true
			uniqueCRDs = append(uniqueCRDs, crd)
		}
	}

	log.WithFields(logrus.Fields{"count": len(uniqueCRDs)}).Tracef("GetCRDs")

	return &clustersProto.GetCRDsResponse{
		Crds: uniqueCRDs,
	}, nil
}

// GetResources returns a list of resources for the given clusters and namespaces.
// To generate this list, we loop over every cluster and namespace and try to get the resources for this. A resource is
// identified by it's Kubernetes API path and name.
func (c *Clusters) GetResources(ctx context.Context, getResourcesRequest *clustersProto.GetResourcesRequest) (*clustersProto.GetResourcesResponse, error) {
	log.WithFields(logrus.Fields{"clusters": getResourcesRequest.Clusters, "namespaces": getResourcesRequest.Namespaces, "resource": getResourcesRequest.Resource, "path": getResourcesRequest.Path, "paramName": getResourcesRequest.ParamName, "param": getResourcesRequest.Param}).Tracef("GetResources")

	var resources []*clustersProto.Resources

	for _, clusterName := range getResourcesRequest.Clusters {
		cluster := c.getCluster(clusterName)
		if cluster == nil {
			return nil, fmt.Errorf("invalid cluster name")
		}

		if isForbidden(getResourcesRequest.Resource) {
			return nil, status.Error(codes.PermissionDenied, fmt.Sprintf("access for resource %s is forbidding", getResourcesRequest.Resource))
		}

		if getResourcesRequest.Namespaces == nil {
			list, err := cluster.GetResources(ctx, "", getResourcesRequest.Path, getResourcesRequest.Resource, getResourcesRequest.ParamName, getResourcesRequest.Param)
			if err != nil {
				return nil, err
			}

			resources = append(resources, &clustersProto.Resources{
				Cluster:      clusterName,
				Namespace:    "",
				ResourceList: list,
			})
		} else {
			for _, namespace := range getResourcesRequest.Namespaces {
				list, err := cluster.GetResources(ctx, namespace, getResourcesRequest.Path, getResourcesRequest.Resource, getResourcesRequest.ParamName, getResourcesRequest.Param)
				if err != nil {
					return nil, err
				}

				resources = append(resources, &clustersProto.Resources{
					Cluster:      clusterName,
					Namespace:    namespace,
					ResourceList: list,
				})
			}
		}

	}

	log.WithFields(logrus.Fields{"count": len(resources)}).Tracef("GetResources")

	return &clustersProto.GetResourcesResponse{
		Resources: resources,
	}, nil
}

// GetLogs returns the log line for the given pod, which is identified by the cluster, namespace and name.
func (c *Clusters) GetLogs(ctx context.Context, getLogsRequest *clustersProto.GetLogsRequest) (*clustersProto.GetLogsResponse, error) {
	log.WithFields(logrus.Fields{"cluster": getLogsRequest.Cluster, "namespace": getLogsRequest.Namespace, "pod": getLogsRequest.Name, "container": getLogsRequest.Container, "regex": getLogsRequest.Regex, "since": getLogsRequest.Since, "previous": getLogsRequest.Previous}).Tracef("GetLogs")

	cluster := c.getCluster(getLogsRequest.Cluster)
	if cluster == nil {
		return nil, fmt.Errorf("invalid cluster name")
	}

	logs, err := cluster.GetLogs(ctx, getLogsRequest.Namespace, getLogsRequest.Name, getLogsRequest.Container, getLogsRequest.Regex, getLogsRequest.Since, getLogsRequest.Previous)
	if err != nil {
		return nil, err
	}

	log.WithFields(logrus.Fields{"count": len(logs)}).Tracef("GetLogs")

	return &clustersProto.GetLogsResponse{
		Logs: logs,
	}, nil
}

// GetApplications returns a list of applications for the given clusters and namespaces.
// To generate this list, we loop over every cluster and namespace and try to get the applications for this.
func (c *Clusters) GetApplications(ctx context.Context, getApplicationsRequest *clustersProto.GetApplicationsRequest) (*clustersProto.GetApplicationsResponse, error) {
	log.WithFields(logrus.Fields{"clusters": getApplicationsRequest.Clusters, "namespaces": getApplicationsRequest.Namespaces}).Tracef("GetApplications")

	var applications []*applicationProto.Application

	for _, clusterName := range getApplicationsRequest.Clusters {
		cluster := c.getCluster(clusterName)
		if cluster == nil {
			return nil, fmt.Errorf("invalid cluster name")
		}

		for _, namespace := range getApplicationsRequest.Namespaces {
			list, err := cluster.GetApplications(ctx, namespace)
			if err != nil {
				return nil, err
			}

			applications = append(applications, list...)
		}
	}

	log.WithFields(logrus.Fields{"count": len(applications)}).Tracef("GetApplications")

	return &clustersProto.GetApplicationsResponse{
		Applications: applications,
	}, nil
}

// GetApplication returns a single application with the given name in the given cluster and namespace. If there isn't,
// such an application an error is returned.
func (c *Clusters) GetApplication(ctx context.Context, getApplicationRequest *clustersProto.GetApplicationRequest) (*clustersProto.GetApplicationResponse, error) {
	log.WithFields(logrus.Fields{"cluster": getApplicationRequest.Cluster, "namespace": getApplicationRequest.Namespace, "name": getApplicationRequest.Name}).Tracef("GetApplication")

	cluster := c.getCluster(getApplicationRequest.Cluster)
	if cluster == nil {
		return nil, fmt.Errorf("invalid cluster name")
	}

	application, err := cluster.GetApplication(ctx, getApplicationRequest.Namespace, getApplicationRequest.Name)
	if err != nil {
		return nil, err
	}

	log.WithFields(logrus.Fields{"application": application}).Tracef("GetApplication")

	return &clustersProto.GetApplicationResponse{
		Application: application,
	}, nil
}

// GetTeams returns all teams. Since this is only used to render the page which shows all teams, we just return the
// name, description and logo of each team.
func (c *Clusters) GetTeams(ctx context.Context, getTeamsRequest *clustersProto.GetTeamsRequest) (*clustersProto.GetTeamsResponse, error) {
	log.Tracef("GetTeams")

	var teams []*teamProto.Team

	for _, team := range c.teams {
		teams = append(teams, &teamProto.Team{
			Name:        team.Name,
			Description: team.Description,
			Logo:        team.Logo,
		})
	}

	log.WithFields(logrus.Fields{"count": len(teams)}).Tracef("GetTeams")

	return &clustersProto.GetTeamsResponse{
		Teams: teams,
	}, nil
}

// GetTeam returns a single team. Each team is identified by his name. This also means that each team name must be
// unique across clusters and namespaces.We use the generated list of teams to identify where we find the Team CR for
// the given team name. Then we return the CR. We also use the list of teams, to get all applications, which can be
// associated with the team and return them within the team.
// Since we are using the generated list of teams, it is possible that a team can not be found directly after it is
// created. The reason for this is that we cache the teams for the specified cache duration via the
// --clusters.cache-duration.teams flag (default 60m). We do this because it can become expensive to generate the list
// of teams, when the number of teams and applications grows.
func (c *Clusters) GetTeam(ctx context.Context, getTeamRequest *clustersProto.GetTeamRequest) (*clustersProto.GetTeamResponse, error) {
	log.WithFields(logrus.Fields{"name": getTeamRequest.Name}).Tracef("GetTeam")

	teamShort := getTeamData(c.teams, getTeamRequest.Name)
	if teamShort == nil {
		return nil, fmt.Errorf("invalid team name")
	}

	cluster := c.getCluster(teamShort.Cluster)
	if cluster == nil {
		return nil, fmt.Errorf("invalid cluster name")
	}

	team, err := cluster.GetTeam(ctx, teamShort.Namespace, getTeamRequest.Name)
	if err != nil {
		return nil, err
	}

	var applications []*applicationProto.Application

	for _, applicationShort := range teamShort.Applications {
		applicationCluster := c.getCluster(applicationShort.Cluster)
		if cluster == nil {
			return nil, fmt.Errorf("invalid cluster name")
		}

		application, err := applicationCluster.GetApplication(ctx, applicationShort.Namespace, applicationShort.Name)
		if err != nil {
			continue
		}

		applications = append(applications, application)
	}

	return &clustersProto.GetTeamResponse{
		Team:         team,
		Applications: applications,
	}, nil
}

// GetTemplates returns a list of templates. The name of a template must be unique accross all clusters and namespace,
// because we only use the name in the CRs and resources to identify a template. If the last fetch was before the
// request time + the cache duration we return the cached templates. If this isn't the case and the lenght of the
// templates slice is 0 we fetch the templates and return them to the user. If the length of the slice is larger then 0,
// we return the cached templates, but trigger a refectch in the background.
func (c *Clusters) GetTemplates(ctx context.Context, getTemplatesRequest *clustersProto.GetTemplatesRequest) (*clustersProto.GetTemplatesResponse, error) {
	log.Tracef("GetTemplates")

	if c.cache.templatesLastFetch.After(time.Now().Add(-1 * cacheDurationTemplates)) {
		return &clustersProto.GetTemplatesResponse{
			Templates: c.cache.templates,
		}, nil
	}

	if c.cache.templates == nil {
		templates := getTemplates(ctx, c.clusters)
		if templates != nil {
			c.cache.templatesLastFetch = time.Now()
			c.cache.templates = templates
		}

		return &clustersProto.GetTemplatesResponse{
			Templates: templates,
		}, nil
	}

	go func() {
		templates := getTemplates(ctx, c.clusters)
		if templates != nil {
			c.cache.templatesLastFetch = time.Now()
			c.cache.templates = templates
		}
	}()

	return &clustersProto.GetTemplatesResponse{
		Templates: c.cache.templates,
	}, nil
}

// GetApplicationsTopology returns the topology for the given list of clusters and namespaces. We add an additional node
// for each cluster and namespace. These nodes are used to group the applications by the cluster and namespace.
func (c *Clusters) GetApplicationsTopology(ctx context.Context, getApplicationsTopologyRequest *clustersProto.GetApplicationsTopologyRequest) (*clustersProto.GetApplicationsTopologyResponse, error) {
	var edges []*clustersProto.Edge
	var nodes []*clustersProto.Node

	for _, clusterName := range getApplicationsTopologyRequest.Clusters {
		nodes = append(nodes, &clustersProto.Node{
			Id:        clusterName,
			Label:     clusterName,
			Type:      "cluster",
			Parent:    "",
			Cluster:   clusterName,
			Namespace: "",
			Name:      "",
		})

		for _, namespace := range getApplicationsTopologyRequest.Namespaces {
			nodes = append(nodes, &clustersProto.Node{
				Id:        clusterName + "-" + namespace,
				Label:     namespace,
				Type:      "namespace",
				Parent:    clusterName,
				Cluster:   clusterName,
				Namespace: namespace,
				Name:      "",
			})

			for _, edge := range c.edges {
				if (edge.SourceCluster == clusterName && edge.SourceNamespace == namespace) || (edge.TargetCluster == clusterName && edge.TargetNamespace == namespace) {
					edges = appendEdgeIfMissing(edges, edge)
				}
			}
		}
	}

	for _, edge := range edges {
		for _, node := range c.nodes {
			if node.Id == edge.Source || node.Id == edge.Target {
				nodes = appendNodeIfMissing(nodes, node)
			}
		}
	}

	return &clustersProto.GetApplicationsTopologyResponse{
		Edges: edges,
		Nodes: nodes,
	}, nil
}

// Load loads all clusters for the given configuration.
// The clusters can be retrieved from different providers. Currently we are supporting incluster configuration and
// kubeconfig files. In the future it is planning to directly support GKE, EKS, AKS, etc.
func Load(config Config) (*Clusters, error) {
	var clusters []*cluster.Cluster

	for _, p := range config.Providers {
		providerClusters, err := provider.GetClusters(&p)
		if err != nil {
			return nil, err
		}

		if providerClusters != nil {
			clusters = append(clusters, providerClusters...)
		}
	}

	d, err := time.ParseDuration(cacheDurationNamespaces)
	if err != nil {
		return nil, err
	}

	for _, c := range clusters {
		c.SetOptions(d)
	}

	cs := &Clusters{
		clusters: clusters,
	}

	go cs.generateTopology()
	go cs.generateTeams()

	return cs, nil
}
