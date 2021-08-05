package auth

import (
	"context"
	"net/http"
	"os"

	flag "github.com/spf13/pflag"
)

// Key to use when setting the user.
type ctxKeyUser int

// userKey is the key that holds the user in a request context.
const userKey ctxKeyUser = 0

// UserHeader is the name of the HTTP Header which contains the user information.
var (
	userHeader string
)

func init() {
	defaultHeader := "X-Auth-Request-Email"
	if os.Getenv("KOBS_API_AUTH_HEADER") != "" {
		defaultHeader = os.Getenv("KOBS_API_AUTH_HEADER")
	}

	flag.StringVar(&userHeader, "api.auth-header", defaultHeader, "The header, which contains the details about the authenticated user.")
}

// Auth is a middleware that injects the user information from a configured request header.
func Auth(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		user := r.Header.Get(userHeader)
		ctx = context.WithValue(ctx, userKey, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	}

	return http.HandlerFunc(fn)
}

// GetUser returns a user from the given context if one is present. Returns the empty string if a user can not be found.
func GetUser(ctx context.Context) string {
	if ctx == nil {
		return ""
	}

	if reqID, ok := ctx.Value(userKey).(string); ok {
		return reqID
	}

	return ""
}
