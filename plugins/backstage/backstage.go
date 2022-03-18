package backstage

import (
	"encoding/json"
	"net/http"

	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/plugins/applications"
	"github.com/kobsio/kobs/plugins/prometheus"
	prometheusInstance "github.com/kobsio/kobs/plugins/prometheus/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

const Route = "/backstage"

type Config struct {
	ApiToken       string `json:"apiToken"`
	PrometheusName string `json:"prometheusName"`
}

type Router struct {
	*chi.Mux
	config             Config
	prometheusInstance *prometheusInstance.Instance
}

func (router *Router) getMetrics(w http.ResponseWriter, r *http.Request) {
	var data prometheus.GetMetricsRequest

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		log.Error(r.Context(), "Could not decode request body", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not decode request body")
		return
	}

	metrics, err := router.prometheusInstance.GetMetrics(r.Context(), data.Queries, data.Resolution, data.TimeStart, data.TimeEnd)
	if err != nil {
		log.Error(r.Context(), "Could not get metrics", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get metrics")
		return
	}

	log.Debug(r.Context(), "Get metrics result", zap.Int("metricsCount", len(metrics.Metrics)))
	render.JSON(w, r, metrics)
}

// Register returns a new router which can be used in the router for the kobs rest api.
func Register(plugins *plugin.Plugins, config Config, applicationsRouter applications.Router, prometheusInstances []*prometheusInstance.Instance) chi.Router {
	plugins.Append(plugin.Plugin{
		Name:        "Backstage",
		DisplayName: "Backstage",
		Description: "Backstage integration",
		Type:        "backstage",
	})

	var promInstance *prometheusInstance.Instance
	for _, i := range prometheusInstances {
		if i.Name == config.PrometheusName {
			promInstance = i
		}
	}
	if promInstance == nil {
		log.Fatal(nil, "Could not find prometheus instance", zap.String("prometheusName", config.PrometheusName))
	}

	router := Router{
		chi.NewRouter(),
		config,
		promInstance,
	}

	authFn := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := r.Header.Get("Authorization")
			if token != config.ApiToken {
				errresponse.Render(w, r, nil, http.StatusUnauthorized, "Authentication failed")
				return
			}
			next.ServeHTTP(w, r)
		})
	}

	router.Route("/", func(r chi.Router) {
		r.Use(authFn)
		r.Get("/application", applicationsRouter.GetApplication)
		r.Post("/metrics", router.getMetrics)
	})

	return router
}
