package resources

import (
	"context"
	"net/http"
	"sync"
	"time"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
	"github.com/kobsio/kobs/pkg/hub/satellites"
	"github.com/kobsio/kobs/pkg/hub/store"
	"github.com/kobsio/kobs/pkg/hub/store/shared"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Config is the configuration for the resources API. At the moment it allows users to configure integration, which can
// be used to set a list of default dashboards which should be added to a resource. This is the same as the
// "kobs.io/dashboards" annotation, but allows to set a list of dashboards for all resources of a certain type which are
// matching the specified labels.
type Config struct {
	Integrations Integrations `json:"integrations"`
}

type Integrations struct {
	Dashboards []Dashboard `json:"dashboards"`
}

type Dashboard struct {
	Resource  string                `json:"resource"`
	Labels    map[string]string     `json:"labels"`
	Dashboard dashboardv1.Reference `json:"dashboard"`
}

type ResourceResponse struct {
	Resource      shared.Resource `json:"resource"`
	ResourceLists []ResourceList  `json:"resourceLists"`
	Errors        []string        `json:"errors"`
	Integrations  Integrations    `json:"integrations"`
}

type ResourceList struct {
	Satellite string         `json:"satellite"`
	Cluster   string         `json:"cluster"`
	List      map[string]any `json:"list"`
}

// Router implements the resources API. It implement a chi.Mux and contains the satellites and store client and the
// configured integration to serve our needs.
type Router struct {
	*chi.Mux
	satellitesClient satellites.Client
	storeClient      store.Client
	integrations     Integrations
}

func (router *Router) getDashboardsFromIntegrationsByID(id string) []Dashboard {
	var dashboards []Dashboard

	for _, dashboard := range router.integrations.Dashboards {
		if dashboard.Resource == id {
			dashboards = append(dashboards, dashboard)
		}
	}

	return dashboards
}

func (router *Router) getResources(w http.ResponseWriter, r *http.Request) {
	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "The user is not authorized to access the resource", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the resource")
		return
	}

	var ids []string
	clusterIDs := r.URL.Query()["clusterID"]
	namespaceIDs := r.URL.Query()["namespaceID"]
	resourceIDs := r.URL.Query()["resourceID"]
	name := r.URL.Query().Get("name")
	path := r.URL.Query().Get("path")
	paramName := r.URL.Query().Get("paramName")
	param := r.URL.Query().Get("param")

	log.Debug(r.Context(), "Resource request", zap.Strings("clusterIDs", clusterIDs), zap.Strings("namespaceIDs", namespaceIDs), zap.Strings("resourceIDs", resourceIDs), zap.String("name", name), zap.String("path", path), zap.String("paramName", paramName), zap.String("param", param))

	if len(namespaceIDs) == 0 {
		if len(clusterIDs) == 0 {
			errresponse.Render(w, r, nil, http.StatusBadRequest, "Cluster and namespace parameters are missing")
			return
		}

		ids = clusterIDs
	} else {
		ids = namespaceIDs
	}

	var resourceResponses []ResourceResponse

	muResources := &sync.Mutex{}
	var wgResources sync.WaitGroup
	wgResources.Add(len(resourceIDs))

	for _, resourceID := range resourceIDs {
		go func(resourceID string) {
			defer wgResources.Done()

			var resource shared.Resource
			resource = shared.GetResourceByID(resourceID)
			if resource.ID == "" {
				crd, err := router.storeClient.GetCRDByID(r.Context(), resourceID)
				if err != nil {
					log.Error(r.Context(), "Resource was not found", zap.Error(err), zap.String("resourceID", resourceID))
					errresponse.Render(w, r, err, http.StatusBadRequest, "Resource was not found")
					return
				}

				resource = shared.CRDToResource(*crd)
			}

			dashboards := router.getDashboardsFromIntegrationsByID(resourceID)

			var resourceLists []ResourceList
			var errors []string

			muNamespaces := &sync.Mutex{}
			var wgNamespaces sync.WaitGroup
			wgNamespaces.Add(len(ids))

			for _, id := range ids {
				go func(id string) {
					defer wgNamespaces.Done()

					satelliteName, cluster, namespace, err := shared.ParseNamespaceID(id)
					if err != nil {
						log.Error(r.Context(), "Could not parse namespace / cluster id", zap.Error(err))
						muNamespaces.Lock()
						errors = append(errors, err.Error())
						muNamespaces.Unlock()
						return
					}

					satellite := router.satellitesClient.GetSatellite(satelliteName)
					if satellite == nil {
						log.Error(r.Context(), "Satellite not found", zap.Error(err))
						muNamespaces.Lock()
						errors = append(errors, "satellite not found")
						muNamespaces.Unlock()
						return
					}

					ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
					defer cancel()

					if resource.Scope == "Cluster" {
						namespace = ""
					}

					if path != "" {
						resource.Path = path
					}

					list, err := satellite.GetResources(ctx, user, cluster, namespace, name, resource.Resource, resource.Path, paramName, param)
					if err != nil {
						log.Error(r.Context(), "Request failed", zap.Error(err))
						muNamespaces.Lock()
						errors = append(errors, err.Error())
						muNamespaces.Unlock()
						return
					}

					muNamespaces.Lock()
					resourceLists = append(resourceLists, ResourceList{Satellite: satelliteName, Cluster: cluster, List: list})
					muNamespaces.Unlock()
				}(id)
			}

			wgNamespaces.Wait()
			muResources.Lock()
			resourceResponses = append(resourceResponses, ResourceResponse{Resource: resource, ResourceLists: resourceLists, Errors: errors, Integrations: Integrations{Dashboards: dashboards}})
			muResources.Unlock()
		}(resourceID)
	}

	wgResources.Wait()
	render.JSON(w, r, resourceResponses)
}

func (router *Router) proxyResources(w http.ResponseWriter, r *http.Request) {
	satelliteName := r.URL.Query().Get("satellite")

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "The user is not authorized to access the plugin", zap.String("satellite", satelliteName), zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the plugin")
		return
	}

	satellite := router.satellitesClient.GetSatellite(satelliteName)
	if satellite == nil {
		log.Error(r.Context(), "Satellite was not found", zap.String("satellite", satelliteName))
		errresponse.Render(w, r, nil, http.StatusInternalServerError, "Satellite was not found")
		return
	}

	r.Header.Add("x-kobs-user", user.ToString())

	satellite.Proxy(w, r)
}

func Mount(config Config, satellitesClient satellites.Client, storeClient store.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		satellitesClient,
		storeClient,
		config.Integrations,
	}

	router.Get("/_", router.getResources)
	router.Get("/", router.proxyResources)
	router.Delete("/", router.proxyResources)
	router.Put("/", router.proxyResources)
	router.Post("/", router.proxyResources)
	router.Get("/logs", router.proxyResources)
	router.HandleFunc("/terminal", router.proxyResources)
	router.Get("/file", router.proxyResources)
	router.Post("/file", router.proxyResources)

	return router
}
