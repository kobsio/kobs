package azure

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"

	"github.com/go-chi/render"
	"go.uber.org/zap"
)

func (router *Router) getActualCosts(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	scope := r.URL.Query().Get("scope")
	timeStart := r.URL.Query().Get("timeStart")
	timeEnd := r.URL.Query().Get("timeEnd")

	log.Debug(r.Context(), "Get costs parameters", zap.String("name", name), zap.String("scope", scope), zap.String("timeStart", timeStart), zap.String("timeEnd", timeEnd))

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

	costs, err := i.CostManagementClient().GetActualCosts(r.Context(), scope, parsedTimeStart, parsedTimeEnd)
	if err != nil {
		log.Error(r.Context(), "Failed to get actual costs", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get actual costs")
		return
	}

	render.JSON(w, r, costs)
}
