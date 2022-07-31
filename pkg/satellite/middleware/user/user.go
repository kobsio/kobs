package user

import (
	"context"
	"encoding/json"
	"net/http"

	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"

	"github.com/kobsio/kobs/pkg/middleware/errresponse"
)

// Handler is a middleware that injects the user provided via the "x-kobs-user" header into the request context.
func Handler() func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {
			var user authContext.User
			err := json.Unmarshal([]byte(r.Header.Get("x-kobs-user")), &user)
			if err != nil {
				errresponse.Render(w, r, nil, http.StatusBadRequest, "x-kobs-user header is missing or invalid")
				return
			}

			ctx := context.WithValue(r.Context(), authContext.UserKey, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		}

		return http.HandlerFunc(fn)
	}
}
