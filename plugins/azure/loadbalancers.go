package azure

import (
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"net/http"

	"github.com/kobsio/kobs/pkg/log"

	"go.uber.org/zap"
)

func (router *Router) getLoadBalancer(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	resourceGroups := r.URL.Query()["resourceGroup"]
	lbName := r.URL.Query().Get("lbName")

	log.Debug(r.Context(), "Get load balancer", zap.Strings("resourceGroups", resourceGroups), zap.String("lbName", lbName))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	loadBalancer, err := i.LoadBalancersClient().GetLoadBalancer(r.Context(), resourceGroups[0], lbName)
	if err != nil {
		log.Error(r.Context(), "Could not get load balancer", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get load balancers")
		return
	}

	render.JSON(w, r, loadBalancer)
}

func (router *Router) getLoadBalancerMetrics(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	resourceUri := r.URL.Query().Get("resourceUri")
	metrics := []string{"ByteCount"}

	log.Debug(r.Context(), "Get load balancer metrics", zap.String("resourceUri", resourceUri))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	loadBalancer, err := i.LoadBalancersClient().GetLoadBalancerMetrics(r.Context(), resourceUri, metrics)
	if err != nil {
		log.Error(r.Context(), "Could not get load balancer", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get load balancers")
		return
	}

	render.JSON(w, r, loadBalancer)
}

func (router *Router) listAllLoadBalancers(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")

	log.Debug(r.Context(), "List all load balancers")

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	loadBalancers, err := i.LoadBalancersClient().ListAllLoadBalancers(r.Context())
	if err != nil {
		log.Error(r.Context(), "Could not list all load balancers", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not list all load balancers")
		return
	}

	render.JSON(w, r, loadBalancers)
}

func (router *Router) listLoadBalancers(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	resourceGroups := r.URL.Query()["resourceGroup"]

	log.Debug(r.Context(), "List load balancers", zap.Strings("resourceGroups", resourceGroups))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	loadBalancers, err := i.LoadBalancersClient().ListLoadBalancers(r.Context(), "")
	if err != nil {
		log.Error(r.Context(), "Could not list load balancers", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not list load balancers")
		return
	}

	render.JSON(w, r, loadBalancers)
}
