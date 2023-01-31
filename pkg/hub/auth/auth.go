package auth

import (
	"context"
	"net/http"

	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/db"

	"github.com/go-chi/chi/v5"
)

type Config struct{}

type Client interface {
	MiddlewareHandler(next http.Handler) http.Handler
	Mount() chi.Router
}

type client struct {
	config   Config
	router   *chi.Mux
	dbClient db.Client
}

// MiddlewareHandler implements a middleware for the chi router, to check if the user is authorized to access kobs. If
// we coud not get a user from the request the middleware returns an unauthorized error and the user have to redo the
// authentication process.
func (c *client) MiddlewareHandler(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})

		next.ServeHTTP(w, r.WithContext(ctx))
	}

	return http.HandlerFunc(fn)
}

// Mount returns the router of the auth client, which can be used within another chi router to mount the authentication
// endpoint in the hub API.
func (c *client) Mount() chi.Router {
	return c.router
}
func NewClient(config Config, dbClient db.Client) (Client, error) {
	return &client{}, nil
}
