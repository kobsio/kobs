package resources

import (
	"context"
	"fmt"
	"net/http"
	"sync"

	dashboardv1 "github.com/kobsio/kobs/pkg/client/kubernetes/apis/dashboard/v1"
	"github.com/kobsio/kobs/pkg/hub/api/shared"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/hub/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/instrument/log"

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
	List map[string]any `json:"list"`
}

// Router implements the resources API. It implement a chi.Mux and contains the satellites and store client and the
// configured integration to serve our needs.
type Router struct {
	*chi.Mux
	clustersClient clusters.Client
	storeClient    db.Client
	integrations   Integrations
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

func (router *Router) prepareResources(ctx context.Context, resourceIDs []string) (map[string]shared.Resource, map[string][]error) {
	resources := make(map[string]shared.Resource)
	errors := make(map[string][]error)

	for _, resourceID := range resourceIDs {
		// TODO: add go routine ??
		resource := shared.GetResourceByID(resourceID)
		if resource.ID == "" {
			crd, err := router.storeClient.GetCRDByID(ctx, resourceID)
			if err != nil {
				errors[resourceID] = append(errors[resourceID], err)
			}

			resources[resourceID] = shared.CRDToResource(*crd)
		}
	}

	return resources, errors
}

func (router *Router) getResources(w http.ResponseWriter, r *http.Request) {
	clusterIDs := r.URL.Query()["clusterID"]
	namespaceIDs := r.URL.Query()["namespaceID"]
	resourceIDs := r.URL.Query()["resourceID"]
	name := r.URL.Query().Get("name")
	path := r.URL.Query().Get("path")
	paramName := r.URL.Query().Get("paramName")
	param := r.URL.Query().Get("param")

	if len(namespaceIDs) == 0 && len(clusterIDs) == 0 {
		errresponse.Render(w, r, http.StatusBadRequest, fmt.Errorf("cluster and namespace parameters are missing"))
		return
	}

	resourcesByID, errorsByResourceID := router.prepareResources(r.Context(), resourceIDs)
	res := &result{}
	wg := sync.WaitGroup{}
	for resourceID, resource := range resourcesByID {
		for _, clusterID := range clusterIDs {
			client := router.clustersClient.GetCluster(clusterID)
			for _, nameSpaceID := range namespaceIDs {
				wg.Add(1)
				go func(fr fetchResource) {
					defer wg.Done()
					fr.run(r.Context())
				}(fetchResource{
					client:     client,
					clusterID:  clusterID,
					resource:   resource,
					resourceId: resourceID,
					namespace:  nameSpaceID,
					name:       name,
					path:       path,
					paramName:  paramName,
					param:      param,
					res:        res,
				})
			}
		}
	}

	resourceResponses := make([]ResourceResponse, 0)
	for k, v := range res.s {
		dashboards := router.getDashboardsFromIntegrationsByID(k.resourceID)
		errs := make([]string, 0)
		for _, err := range errorsByResourceID[k.resourceID] {
			errs = append(errs, fmt.Sprintf("unexpected error for %s: %s", k.resourceID, err))
		}

		resourceResponses = append(
			resourceResponses,
			ResourceResponse{
				Resource:      resourcesByID[k.resourceID],
				ResourceLists: v,
				Errors:        errs,
				Integrations:  Integrations{Dashboards: dashboards},
			},
		)
	}

	render.JSON(w, r, resourceResponses)
}

func (router *Router) proxyResources(w http.ResponseWriter, r *http.Request) {
	cluster := r.URL.Query().Get("cluster")
	user := authContext.MustGetUser(r.Context())

	// TODO
	// if !user.HasReasourceAccess(...) {}
	// verb = http.Method (* means GET POST ...)
	// resources parameter pods/log pods/exec or resource name (pods = should be in query)
	// maybe use middleware to handle this stuff

	router.clustersClient.GetCluster(cluster)
	clusterClient := router.clustersClient.GetCluster(cluster)
	if clusterClient == nil {
		log.Error(r.Context(), "cluster client not found", zap.String("cluster", cluster))
		errresponse.Render(w, r, http.StatusNotFound, fmt.Errorf("cluster not found"))
		return
	}

	r.Header.Add("x-kobs-user", user.ToString())

	clusterClient.Proxy(w, r)
}

func Mount(config Config, clustersClient clusters.Client, storeClient db.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		clustersClient,
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
