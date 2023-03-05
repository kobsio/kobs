package resources

import (
	"context"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/kobsio/kobs/pkg/hub/app/settings"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type ResourceResponse struct {
	Resource   Resource                  `json:"resource"`
	Error      string                    `json:"error"`
	Clusters   []ResourceResponseCluster `json:"clusters"`
	Dashboards []settings.Dashboard      `json:"dashboards"`
}

type ResourceResponseCluster struct {
	Cluster    string                      `json:"cluster"`
	Error      string                      `json:"error"`
	Namespaces []ResourceResponseNamespace `json:"namespaces"`
}

type ResourceResponseNamespace struct {
	Namespace string         `json:"namespace"`
	Error     string         `json:"error"`
	Manifest  map[string]any `json:"manifest"`
}

// Router implements the resources API. It implement a chi.Mux and contains the satellites and store client and the
// configured integration to serve our needs.
type Router struct {
	*chi.Mux
	appSettings    settings.Settings
	clustersClient clusters.Client
	dbClient       db.Client
}

func (router *Router) resourcesHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	user := authContext.MustGetUser(ctx)

	// When the `x-kobs-cluster` header is set or when the request url contains a query parameter `x-kobs-cluster` we
	// proxy the request to the corresponding cluster. For that we will get the cluster from the clusters client. Check
	// the users permissions dependening on the request url and the call the `Proxy` method of the cluster client.
	clusterHeader := r.Header.Get("x-kobs-cluster")
	if clusterHeader == "" {
		clusterHeader = r.URL.Query().Get("x-kobs-cluster")
	}

	if clusterHeader != "" {
		clusterClient := router.clustersClient.GetCluster(clusterHeader)
		if clusterClient == nil {
			log.Warn(ctx, fmt.Sprintf("Invalid cluster name: %s", clusterHeader), zap.String("cluster", clusterHeader))
			errresponse.Render(w, r, http.StatusBadRequest, fmt.Sprintf("Invalid cluster name: %s", clusterHeader))
			return
		}

		if strings.HasSuffix(r.URL.Path, "/logs") {
			if !user.HasResourceAccess(clusterHeader, r.URL.Query().Get("namespace"), "pods/logs", "*") {
				log.Warn(ctx, "User is not authorized to access resource", zap.String("cluster", clusterHeader), zap.String("namespace", r.URL.Query().Get("namespace")), zap.String("resource", "pods/logs"), zap.String("method", "*"))
				errresponse.Render(w, r, http.StatusUnauthorized)
				return
			}
		} else if strings.HasSuffix(r.URL.Path, "/terminal") || strings.HasSuffix(r.URL.Path, "/file") {
			if !user.HasResourceAccess(clusterHeader, r.URL.Query().Get("namespace"), "pods/exec", "*") {
				log.Warn(ctx, "User is not authorized to access resource", zap.String("cluster", clusterHeader), zap.String("namespace", r.URL.Query().Get("namespace")), zap.String("resource", "pods/logs"), zap.String("method", "*"))
				errresponse.Render(w, r, http.StatusUnauthorized)
				return
			}
		} else {
			if !user.HasResourceAccess(clusterHeader, r.URL.Query().Get("namespace"), r.URL.Query().Get("resource"), r.Method) {
				log.Warn(ctx, "User is not authorized to access resource", zap.String("cluster", clusterHeader), zap.String("namespace", r.URL.Query().Get("namespace")), zap.String("resource", r.URL.Query().Get("resource")), zap.String("method", r.Method))
				errresponse.Render(w, r, http.StatusUnauthorized)
				return
			}
		}

		clusterClient.Proxy(w, r)
		return
	}

	// If the request doesn't contain the `x-kobs-cluster` header or query parameter, we only continue when the request
	// method is get.
	if r.Method != http.MethodGet {
		log.Warn(ctx, "Method not allowed", zap.String("method", r.Method))
		errresponse.Render(w, r, http.StatusMethodNotAllowed)
		return
	}

	// When the user requests a list of resources, we allow him to select multiple clusters, namespaces and resources,
	// so that we can not directly proxy the request to the corresponding cluster. Instead we make one request for each
	// resource, cluster and namespace to the corresponding cluster. The results of each request will be combined into
	// one response.
	//
	// To minimize the time a user has to wait for the result, we parallize all requests via wait groups.
	clusters := r.URL.Query()["cluster"]
	namespaces := r.URL.Query()["namespace"]
	resources := r.URL.Query()["resource"]
	paramName := r.URL.Query().Get("paramName")
	param := r.URL.Query().Get("param")

	log.Debug(r.Context(), "Get resources", zap.Strings("clusters", clusters), zap.Strings("namespaces", namespaces), zap.Strings("resources", resources), zap.String("paramName", paramName), zap.String("param", param))

	if len(clusters) == 0 {
		log.Warn(ctx, "The parameter 'cluster' is required", zap.Strings("resources", resources))
		errresponse.Render(w, r, http.StatusBadRequest, "The parameter 'cluster' is required")
		return
	}

	if len(resources) == 0 {
		log.Warn(ctx, "The parameter 'resource' is required", zap.Strings("resources", resources))
		errresponse.Render(w, r, http.StatusBadRequest, "The parameter 'resource' is required")
		return
	}

	var resourceResponses []ResourceResponse

	muResourceResponses := &sync.Mutex{}
	var wgResourceResponses sync.WaitGroup
	wgResourceResponses.Add(len(resources))

	for _, resource := range resources {
		go func(resource string) {
			defer wgResourceResponses.Done()

			var r Resource
			r = GetResource(resource)
			if r.ID == "" {
				crd, err := router.dbClient.GetCRDByID(ctx, resource)
				if err != nil {
					log.Error(ctx, "Resource not found", zap.Error(err), zap.String("resource", resource))
					muResourceResponses.Lock()
					resourceResponses = append(resourceResponses, ResourceResponse{Resource: Resource{ID: resource, Title: resource}, Error: "Resource not found"})
					muResourceResponses.Unlock()
					return
				}

				r = CRDToResource(*crd)
			}

			dashboards := router.appSettings.GetDashboardsFromResourcesIntegrations(resource)

			var resourceResponseCluster []ResourceResponseCluster

			muClusters := &sync.Mutex{}
			var wgClusters sync.WaitGroup
			wgClusters.Add(len(clusters))

			for _, cluster := range clusters {
				go func(cluster string) {
					defer wgClusters.Done()

					clusterClient := router.clustersClient.GetCluster(cluster)
					if clusterClient != nil {
						if len(namespaces) == 0 {
							if !user.HasResourceAccess(cluster, "", resource, "get") {
								log.Warn(ctx, "User is not authorized to access the resource", zap.String("cluster", cluster), zap.String("namespace", "*"), zap.String("resource", resource), zap.String("verb", "get"))
								muClusters.Lock()
								resourceResponseCluster = append(resourceResponseCluster, ResourceResponseCluster{Cluster: cluster, Namespaces: []ResourceResponseNamespace{{Namespace: "", Error: fmt.Sprintf("You are not authorized to access the resources in %s", cluster)}}})
								muClusters.Unlock()
								return
							}

							ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
							defer cancel()

							manifest, err := clusterClient.Request(ctx, http.MethodGet, fmt.Sprintf("/api/resources?namespace=%s&resource=%s&path=%s&paramName=%s&param=%s", "", r.Resource, r.Path, paramName, param), nil)
							if err != nil {
								log.Error(ctx, "Failed to get resources", zap.Error(err))
								muClusters.Lock()
								resourceResponseCluster = append(resourceResponseCluster, ResourceResponseCluster{Cluster: cluster, Namespaces: []ResourceResponseNamespace{{Namespace: "", Error: fmt.Sprintf("Failed to get resources for %s", cluster)}}})
								muClusters.Unlock()
								return
							}

							muClusters.Lock()
							resourceResponseCluster = append(resourceResponseCluster, ResourceResponseCluster{Cluster: cluster, Namespaces: []ResourceResponseNamespace{{Namespace: "", Manifest: manifest}}})
							muClusters.Unlock()
							return
						}

						var resourceResponseNamespace []ResourceResponseNamespace

						muNamespaces := &sync.Mutex{}
						var wgNamespaces sync.WaitGroup
						wgNamespaces.Add(len(namespaces))

						for _, namespace := range namespaces {
							go func(namespace string) {
								defer wgNamespaces.Done()

								if !user.HasResourceAccess(cluster, namespace, resource, "get") {
									log.Warn(ctx, "User is not authorized to access the resource", zap.String("cluster", cluster), zap.String("namespace", namespace), zap.String("resource", resource), zap.String("verb", "get"))
									muNamespaces.Lock()
									resourceResponseNamespace = append(resourceResponseNamespace, ResourceResponseNamespace{Namespace: namespace, Error: fmt.Sprintf("You are not authorized to access the resources in %s / %s", cluster, namespace)})
									muNamespaces.Unlock()
									return
								}

								ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
								defer cancel()

								if r.Scope == "Cluster" {
									namespace = ""
								}

								manifest, err := clusterClient.Request(ctx, http.MethodGet, fmt.Sprintf("/api/resources?namespace=%s&resource=%s&path=%s&paramName=%s&param=%s", namespace, r.Resource, r.Path, paramName, param), nil)
								if err != nil {
									log.Error(ctx, "Failed to get resources", zap.Error(err))
									muNamespaces.Lock()
									resourceResponseNamespace = append(resourceResponseNamespace, ResourceResponseNamespace{Namespace: namespace, Error: fmt.Sprintf("Failed to get resources for %s / %s", cluster, namespace)})
									muNamespaces.Unlock()
									return
								}

								muNamespaces.Lock()
								resourceResponseNamespace = append(resourceResponseNamespace, ResourceResponseNamespace{Namespace: namespace, Manifest: manifest})
								muNamespaces.Unlock()
								return
							}(namespace)
						}

						wgNamespaces.Wait()

						sort.Slice(resourceResponseNamespace, func(i, j int) bool {
							return resourceResponseNamespace[i].Namespace < resourceResponseNamespace[j].Namespace
						})

						muClusters.Lock()
						resourceResponseCluster = append(resourceResponseCluster, ResourceResponseCluster{Cluster: cluster, Namespaces: resourceResponseNamespace})
						muClusters.Unlock()
						return
					}

					muClusters.Lock()
					resourceResponseCluster = append(resourceResponseCluster, ResourceResponseCluster{Cluster: cluster, Error: fmt.Sprintf("Failed to find cluster %s", cluster)})
					muClusters.Unlock()
					return
				}(cluster)
			}

			wgClusters.Wait()

			sort.Slice(resourceResponseCluster, func(i, j int) bool {
				return resourceResponseCluster[i].Cluster < resourceResponseCluster[j].Cluster
			})

			muResourceResponses.Lock()
			resourceResponses = append(resourceResponses, ResourceResponse{Resource: r, Clusters: resourceResponseCluster, Dashboards: dashboards})
			muResourceResponses.Unlock()
			return
		}(resource)
	}

	wgResourceResponses.Wait()

	sort.Slice(resourceResponses, func(i, j int) bool {
		return resourceResponses[i].Resource.Title < resourceResponses[j].Resource.Title
	})

	render.JSON(w, r, resourceResponses)
}

func Mount(appSettings settings.Settings, clustersClient clusters.Client, dbClient db.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		appSettings,
		clustersClient,
		dbClient,
	}

	router.HandleFunc("/*", router.resourcesHandler)

	return router
}
