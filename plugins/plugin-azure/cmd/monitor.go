package azure

import (
	"net/http"
	"strconv"

	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"github.com/go-chi/render"
	"go.uber.org/zap"
)

func (router *Router) getMetrics(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	resourceGroup := r.URL.Query().Get("resourceGroup")
	provider := r.URL.Query().Get("provider")
	metricNames := r.URL.Query().Get("metricNames")
	aggregationType := r.URL.Query().Get("aggregationType")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")

	log.Debug(r.Context(), "Get metrics parameters", zap.String("name", name), zap.String("resourceGroup", resourceGroup), zap.String("provider", provider), zap.String("metricNames", metricNames), zap.String("aggregationType", aggregationType), zap.String("timeStart", timeStart), zap.String("timeEnd", timeEnd))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	user, err := authContext.GetUser(r.Context())
	if err != nil {
		log.Warn(r.Context(), "User is not authorized to get metrics", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to get metrics")
		return
	}

	err = i.CheckPermissions(name, user, "monitor", resourceGroup, r.Method)
	if err != nil {
		log.Warn(r.Context(), "User is not allowed to get the metrics", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to view metrics")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse start time", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		log.Error(r.Context(), "Could not parse end time", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse end time")
		return
	}

	metrics, err := i.MonitorClient().GetMetrics(r.Context(), resourceGroup, provider, metricNames, aggregationType, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Could not get metrics", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get metrics")
		return
	}

	render.JSON(w, r, metrics)
}
