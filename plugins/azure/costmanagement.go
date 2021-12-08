package azure

import (
	"net/http"
	"strconv"

	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/sirupsen/logrus"
)

func (router *Router) getActualCost(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	log.WithFields(logrus.Fields{"name": name}).Tracef("getActualCost")

	timeframe, err := strconv.Atoi(r.URL.Query().Get("timeframe"))
	if err != nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Invalid timeframe parameter")
		return
	}

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	costUsage, err := i.CostManagement.GetActualCost(r.Context(), timeframe)
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not query cost usage")
		return
	}

	render.JSON(w, r, costUsage)

}
