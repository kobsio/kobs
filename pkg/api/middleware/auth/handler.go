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
	flagEnabled     bool
	flagUserHeader  string
	flagInterval    time.Duration
	flagDefaultTeam string
)

func init() {
	defaultHeader := "X-Auth-Request-Email"
	if os.Getenv("KOBS_API_AUTH_HEADER") != "" {
		defaultHeader = os.Getenv("KOBS_API_AUTH_HEADER")
	}

	defaultInterval := time.Duration(1 * time.Hour)
	if os.Getenv("KOBS_API_AUTH_INTERVAL") != "" {
		parsedDefaultInterval, err := time.ParseDuration(os.Getenv("KOBS_API_AUTH_INTERVAL"))
		if err == nil && parsedDefaultInterval > 60*time.Second {
			defaultInterval = parsedDefaultInterval
		}
	}

	defaultTeam := ""
	if os.Getenv("KOBS_API_AUTH_DEFAULT_TEAM") != "" {
		defaultTeam = os.Getenv("KOBS_API_AUTH_DEFAULT_TEAM")
	}

	flag.BoolVar(&flagEnabled, "api.auth.enabled", false, "Enable the authentication and authorization middleware.")
	flag.StringVar(&flagUserHeader, "api.auth.header", defaultHeader, "The header, which contains the details about the authenticated user.")
	flag.StringVar(&flagDefaultTeam, "api.auth.default-team", defaultTeam, "The name of the team, which should be used for a users permissions when a user hasn't any teams. The team is specified in the following format: \"cluster,namespace,name\"")
	flag.DurationVar(&flagInterval, "api.auth.interval", defaultInterval, "The interval to refresh the internal users list and there permissions.")
}

// Handler creates a new Auth handler with passed options.
func Handler(clusters *clusters.Clusters) func(next http.Handler) http.Handler {
	a := New(flagEnabled, flagUserHeader, flagDefaultTeam, flagInterval, clusters)
	go a.GetPermissions()
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
