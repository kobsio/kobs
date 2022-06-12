package userauth

import (
	"net/http"
	"time"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

type Router struct {
	*chi.Mux
	authLogoutRedirect string
}

func (router *Router) userAuthHandler(w http.ResponseWriter, r *http.Request) {
	user, err := authContext.GetUser(r.Context())
	if err != nil {
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the resource")
		return
	}

	render.JSON(w, r, user)
}

func (router *Router) userLogoutHandler(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "kobs-auth",
		Value:    "",
		Secure:   true,
		HttpOnly: true,
		Expires:  time.Unix(0, 0),
	})

	http.Redirect(w, r, router.authLogoutRedirect, http.StatusSeeOther)
}

func Mount(authLogoutRedirect string) chi.Router {
	router := Router{
		chi.NewRouter(),
		authLogoutRedirect,
	}

	router.Get("/", router.userAuthHandler)
	router.Get("/logout", router.userLogoutHandler)

	return router
}
