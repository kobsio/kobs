package users

import (
	"net/http"

	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"github.com/go-chi/render"
	"go.uber.org/zap"
)

func (router *Router) getUsers(w http.ResponseWriter, r *http.Request) {
	log.Debug(r.Context(), "Get users")

	var users []userv1.UserSpec

	for _, cluster := range router.clustersClient.GetClusters() {
		user, err := cluster.GetUsers(r.Context(), "")
		if err != nil {
			log.Error(r.Context(), "Could not get users")
			errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get users")
			return
		}

		users = append(users, user...)
	}

	log.Debug(r.Context(), "Get users result", zap.Int("usersCount", len(users)))
	render.JSON(w, r, users)
}
