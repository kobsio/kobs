package user

import (
	"net/http"
	"time"

	"github.com/go-chi/render"
	"github.com/kobsio/kobs/pkg/kube/clusters"
	authContext "github.com/kobsio/kobs/pkg/middleware/auth/user/context"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"
)

// Handler creates a new Auth handler with the options defined via the above flags.
func Handler(enabled bool, headerUser, headerTeams, sessionToken string, sessionInterval time.Duration, clustersClient clusters.Client) func(next http.Handler) http.Handler {
	a := New(enabled, headerUser, headerTeams, sessionToken, sessionInterval, clustersClient)
	return a.Handler
}

// UserHandler returns the information of the authenticated user.
func UserHandler(w http.ResponseWriter, r *http.Request) {
	user, err := authContext.GetUser(r.Context())
	if err != nil {
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the resource")
		return
	}

	render.JSON(w, r, user)
}
