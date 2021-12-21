package azure

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/log"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

func (router *Router) getResourceGroups(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")

	log.Debug(r.Context(), "Get resource groups parameters.", zap.String("name", name))

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Could not find instance name.", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	resourceGroups, err := i.ResourceGroups.ListResourceGroups(r.Context())
	if err != nil {
		log.Error(r.Context(), "Could not list resource groups.", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not list resource groups")
		return
	}

	render.JSON(w, r, resourceGroups)
}
