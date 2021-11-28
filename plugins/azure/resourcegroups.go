package azure

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/sirupsen/logrus"
)

func (router *Router) getResourceGroups(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")

	log.WithFields(logrus.Fields{"name": name}).Tracef("getResourceGroups")

	i := router.getInstance(name)
	if i == nil {
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	resourceGroups, err := i.ResourceGroups.ListResourceGroups(r.Context())
	if err != nil {
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not list resource groups")
		return
	}

	render.JSON(w, r, resourceGroups)
}
