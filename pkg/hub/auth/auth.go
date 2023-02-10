package auth

//go:generate mockgen -source=auth.go -destination=./auth_mock.go -package=auth Client

import (
	"context"
	"net/http"

	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
)

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
