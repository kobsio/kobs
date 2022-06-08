package main

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"github.com/go-chi/render"
	"go.uber.org/zap"
)

func (router *Router) getActualCosts(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	scope := r.URL.Query().Get("scope")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")

	log.Debug(r.Context(), "Get actual costs parameters", zap.String("name", name), zap.String("scope", scope), zap.String("timeStart", timeStart), zap.String("timeEnd", timeEnd))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
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

	costUsage, err := i.CostManagementClient().GetActualCost(r.Context(), scope, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Could not query cost usage", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not query cost usage")
		return
	}

	render.JSON(w, r, costUsage)
}
