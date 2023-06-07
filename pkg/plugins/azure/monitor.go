package azure

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"

	"github.com/go-chi/render"
	"go.uber.org/zap"
)

func (router *Router) getMetrics(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	resourceGroup := r.URL.Query().Get("resourceGroup")
	provider := r.URL.Query().Get("provider")
	metric := r.URL.Query().Get("metric")
	aggregationType := r.URL.Query().Get("aggregationType")
	interval := r.URL.Query().Get("interval")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")

	log.Debug(r.Context(), "Get metrics parameters", zap.String("name", name), zap.String("resourceGroup", resourceGroup), zap.String("provider", provider), zap.String("metric", metric), zap.String("aggregationType", aggregationType), zap.String("timeStart", timeStart), zap.String("timeEnd", timeEnd))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid instance name", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid instance name")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Failed to parse start time", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Failed to parse end time", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to parse end time")
		return
	}

	metrics, err := i.MonitorClient().GetMetrics(r.Context(), resourceGroup, provider, metric, aggregationType, interval, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Failed to get metrics", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get metrics")
		return
	}

	render.JSON(w, r, metrics)
}

func (router *Router) getMetricDefinitions(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	resourceGroup := r.URL.Query().Get("resourceGroup")
	provider := r.URL.Query().Get("provider")

	log.Debug(r.Context(), "Get metrics parameters", zap.String("name", name), zap.String("resourceGroup", resourceGroup), zap.String("provider", provider))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid instance name", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid instance name")
		return
	}

	metricDefinitions, err := i.MonitorClient().GetMetricDefinitions(r.Context(), resourceGroup, provider)
	if err != nil {
		log.Error(r.Context(), "Failed to get metric definitions", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get metric definitions")
		return
	}

	render.JSON(w, r, metricDefinitions)
}
