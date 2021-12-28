package auth

import (
	"net/http"
	"os"
	"time"

	"github.com/go-chi/render"
	"github.com/kobsio/kobs/pkg/api/clusters"
	authContext "github.com/kobsio/kobs/pkg/api/middleware/auth/context"
	"github.com/kobsio/kobs/pkg/api/middleware/errresponse"

	flag "github.com/spf13/pflag"
)

var (
	flagEnabled         bool
	flagHeaderUser      string
	flagHeaderTeams     string
	flagSessionToken    string
	flagSessionInterval time.Duration
)

func init() {
	defaultHeaderUser := "X-Auth-Request-Email"
	if os.Getenv("KOBS_API_AUTH_HEADER_USER") != "" {
		defaultHeaderUser = os.Getenv("KOBS_API_AUTH_HEADER_USER")
	}

	defaultHeaderTeams := "X-Auth-Request-Groups"
	if os.Getenv("KOBS_API_AUTH_HEADER_TEAMS") != "" {
		defaultHeaderTeams = os.Getenv("KOBS_API_AUTH_HEADER_TEAMS")
	}

	defaultSessionToken := ""
	if os.Getenv("KOBS_API_AUTH_SESSION_TOKEN") != "" {
		defaultSessionToken = os.Getenv("KOBS_API_AUTH_SESSION_TOKEN")
	}

	defaultSessionInterval := time.Duration(48 * time.Hour)
	if os.Getenv("KOBS_API_AUTH_SESSION_INTERVAL") != "" {
		parsedDefaultSessionInterval, err := time.ParseDuration(os.Getenv("KOBS_API_AUTH_SESSION_INTERVAL"))
		if err == nil && parsedDefaultSessionInterval > 60*time.Second {
			defaultSessionInterval = parsedDefaultSessionInterval
		}
	}

	flag.BoolVar(&flagEnabled, "api.auth.enabled", false, "Enable the authentication and authorization middleware.")
	flag.StringVar(&flagHeaderUser, "api.auth.header.user", defaultHeaderUser, "The header, which contains the user id.")
	flag.StringVar(&flagHeaderTeams, "api.auth.header.teams", defaultHeaderTeams, "The header, which contains the team ids.")
	flag.StringVar(&flagSessionToken, "api.auth.session.token", defaultSessionToken, "The token to encrypt the session cookie.")
	flag.DurationVar(&flagSessionInterval, "api.auth.session.interval", defaultSessionInterval, "The interval for how long a session is valid.")
}

// Handler creates a new Auth handler with the options defined via the above flags.
func Handler(clustersClient clusters.Client) func(next http.Handler) http.Handler {
	a := New(flagEnabled, flagHeaderUser, flagHeaderTeams, flagSessionToken, flagSessionInterval, clustersClient)
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
