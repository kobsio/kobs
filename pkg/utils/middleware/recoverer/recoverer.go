package recoverer

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"
)

// Handler is a middleware for a HTTP handler to recover from panics. This is used as dropped in replacement for the
// [github.com/go-chi/chi/v5/middleware.Recoverer] chi middleware. We use it because we do not need to log the error
// again, because it was already logged by our httplog middleware and we just want to return an internal server error
// for the case of a panic.
func Handler(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil && err != http.ErrAbortHandler {
				errresponse.Render(w, r, http.StatusInternalServerError)
			}
		}()

		next.ServeHTTP(w, r)
	}

	return http.HandlerFunc(fn)
}
