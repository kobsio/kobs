package tokenauth

import (
	"net/http"
	"strings"

	"github.com/kobsio/kobs/pkg/middleware/errresponse"
)

// Handler is a middleware that handles token based authentication.
func Handler(token string) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {
			if token != "" {
				authHeader := r.Header.Get("Authorization")
				if !strings.HasPrefix(authHeader, "Bearer ") || strings.TrimLeft(authHeader, "Bearer ") != token {
					errresponse.Render(w, r, nil, http.StatusUnauthorized, "You are not authorized to access the resource")
					return
				}
			}

			next.ServeHTTP(w, r)
		}

		return http.HandlerFunc(fn)
	}
}
