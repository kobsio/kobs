package azure

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/sirupsen/logrus"
)

func (router *Router) getMetrics(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	resourceGroup := r.URL.Query().Get("resourceGroup")
	provider := r.URL.Query().Get("provider")
	metricName := r.URL.Query().Get("metricName")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")

	log.WithFields(logrus.Fields{"name": name, "resourceGroup": resourceGroup, "provider": provider, "metricName": metricName, "timeStart": timeStart, "timeEnd": timeEnd}).Tracef("getMetrics")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	err := i.CheckPermissions(r, "monitor", resourceGroup)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusForbidden, "You are not allowed to view metrics")
		return
	}

	parsedTimeStart, err := strconv.ParseInt(timeStart, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse start time")
		return
	}

	parsedTimeEnd, err := strconv.ParseInt(timeEnd, 10, 64)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not parse end time")
		return
	}

	metrics, err := i.Monitor.GetMetrics(r.Context(), resourceGroup, provider, metricName, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get metrics")
		return
	}

	render.JSON(w, r, metrics)
}
