package azure

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/log"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

func (router *Router) getActualCost(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	timeframe := r.URL.Query().Get("timeframe")
	scope := r.URL.Query().Get("scope")

	log.Debug(r.Context(), "Get actual costs parameters.", zap.String("name", name), zap.String("timeframe", timeframe), zap.String("scope", scope))

	timeframeParsed, err := strconv.Atoi(timeframe)
	if err != nil {
		log.Error(r.Context(), "Invalid timeframe parameter.", zap.Error(err))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid timeframe parameter")
		return
	}

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	costUsage, err := i.CostManagement.GetActualCost(r.Context(), timeframeParsed, scope)
	if err != nil {
		log.Error(r.Context(), "Could not query cost usage.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not query cost usage")
		return
	}

	render.JSON(w, r, costUsage)
}
