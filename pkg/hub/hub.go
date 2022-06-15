package hub

import (
	"context"
	"net/http"
	"time"

	"github.com/kobsio/kobs/pkg/hub/api"
	"github.com/kobsio/kobs/pkg/hub/api/applications"
	"github.com/kobsio/kobs/pkg/hub/api/clusters"
	"github.com/kobsio/kobs/pkg/hub/api/dashboards"
	"github.com/kobsio/kobs/pkg/hub/api/plugins"
	"github.com/kobsio/kobs/pkg/hub/api/resources"
	"github.com/kobsio/kobs/pkg/hub/api/teams"
	"github.com/kobsio/kobs/pkg/hub/api/users"
	"github.com/kobsio/kobs/pkg/hub/middleware/userauth"
	"github.com/kobsio/kobs/pkg/hub/satellites"
	"github.com/kobsio/kobs/pkg/hub/store"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/debug"
	"github.com/kobsio/kobs/pkg/middleware/httplog"
	"github.com/kobsio/kobs/pkg/middleware/metrics"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Server is the interface of a hub service, which provides the options to start and stop the underlying http server.
type Server interface {
	Start()
	Stop()
}

// server implements the Server interface.
type server struct {
	server *http.Server
}

// Start starts serving the hub server.
func (s *server) Start() {
	log.Info(nil, "Hub server started", zap.String("address", s.server.Addr))

	if err := s.server.ListenAndServe(); err != nil {
		if err != http.ErrServerClosed {
			log.Error(nil, "Hub server died unexpected", zap.Error(err))
		}
	}
}

// Stop terminates the hub server gracefully.
func (s *server) Stop() {
	log.Debug(nil, "Start shutdown of the hub server")

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	err := s.server.Shutdown(ctx)
	if err != nil {
		log.Error(nil, "Graceful shutdown of the hub server failed", zap.Error(err))
	}
}

// New return a new hub server. It creates the underlying http server, with the given address.
//
// We exclude the health check from all middlewares, because the health check just returns 200. Therefore we do not need
// our defined middlewares like request id, metrics, auth or loggin. This also makes it easier to analyze the logs in a
// Kubernetes cluster where the health check is called every x seconds, because we generate less logs.
func New(config api.Config, debugUsername, debugPassword, hubAddress string, authEnabled bool, authHeaderUser, authHeaderTeams, authLogoutRedirect, authSessionToken string, authSessionInterval time.Duration, satellitesClient satellites.Client, storeClient store.Client) (Server, error) {
	router := chi.NewRouter()
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type"},
	}))

	if debugUsername != "" && debugPassword != "" {
		router.Mount("/api/debug", debug.Mount(debugUsername, debugPassword))
	}

	router.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		render.JSON(w, r, nil)
	})

	router.Route("/api", func(r chi.Router) {
		r.Use(middleware.RequestID)
		r.Use(middleware.Recoverer)
		r.Use(middleware.URLFormat)
		r.Use(metrics.Metrics)
		r.Use(httplog.Logger)
		r.Use(userauth.Handler(authEnabled, authHeaderUser, authHeaderTeams, authSessionToken, authSessionInterval, storeClient))
		r.Use(render.SetContentType(render.ContentTypeJSON))

		r.Mount("/auth", userauth.Mount(authLogoutRedirect))
		r.Mount("/clusters", clusters.Mount(storeClient))
		r.Mount("/applications", applications.Mount(storeClient))
		r.Mount("/teams", teams.Mount(storeClient))
		r.Mount("/users", users.Mount(config.Users, storeClient))
		r.Mount("/dashboards", dashboards.Mount(storeClient))
		r.Mount("/resources", resources.Mount(satellitesClient, storeClient))
		r.Mount("/plugins", plugins.Mount(satellitesClient, storeClient))
	})

	return &server{
		server: &http.Server{
			Addr:    hubAddress,
			Handler: router,
		},
	}, nil
}
