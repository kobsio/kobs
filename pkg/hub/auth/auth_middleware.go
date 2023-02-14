package auth

import (
	"context"
	"fmt"
	"net/http"
	"time"

	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"
	"go.uber.org/zap"
)

// MiddlewareHandler implements a middleware for the chi router, to check if the user is authorized to access kobs.
//   - responds with an Unauthorized status code, when the accesstoken is invalid
//   - sets the current user as value to the context key `authContext.UserKey`
//   - sets the expiry date of the accesstoken as response header, this allows the client to send a /refresh request,
//     when the token is close to it's expiry date
func (c *client) MiddlewareHandler(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		user, expiry, err := c.getUserFromRequest(r)
		if err != nil {
			log.Error(ctx, "failed to grab user from request", zap.Error(err))
			errresponse.Render(w, r, http.StatusUnauthorized, fmt.Errorf("unauthorized"))
			return
		}
		if user == nil {
			log.Error(ctx, "unexpected error in auth middleware, user is unexpectedly nil")
			errresponse.Render(w, r, http.StatusInternalServerError, fmt.Errorf("couldn't get user from request"))
			return
		}

		w.Header().Set("x-kobs-token-expiry", expiry.Format(time.RFC3339))
		ctx = context.WithValue(ctx, authContext.UserKey, *user)
		next.ServeHTTP(w, r.WithContext(ctx))
	}

	return http.HandlerFunc(fn)
}
