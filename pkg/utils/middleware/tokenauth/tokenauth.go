package tokenauth

import (
	"net/http"
	"strings"

	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"
)

// Handler is a middleware that handles token based authentication.
func Handler(token string) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {
			if token != "" {
				authHeader := r.Header.Get("Authorization")
				if !strings.HasPrefix(authHeader, "Bearer ") || strings.TrimPrefix(authHeader, "Bearer ") != token {
					errresponse.Render(w, r, http.StatusUnauthorized, nil)
					return
				}
			}

			next.ServeHTTP(w, r)
		}

		return http.HandlerFunc(fn)
	}
}
