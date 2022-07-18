package satellite

import (
	"context"
	"net/http"
	"time"

	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/debug"
	"github.com/kobsio/kobs/pkg/middleware/httplog"
	"github.com/kobsio/kobs/pkg/middleware/httpmetrics"
	"github.com/kobsio/kobs/pkg/middleware/httptracer"
	"github.com/kobsio/kobs/pkg/satellite/api"
	"github.com/kobsio/kobs/pkg/satellite/api/applications"
	apiClusters "github.com/kobsio/kobs/pkg/satellite/api/clusters"
	"github.com/kobsio/kobs/pkg/satellite/api/dashboards"
	"github.com/kobsio/kobs/pkg/satellite/api/resources"
	"github.com/kobsio/kobs/pkg/satellite/api/teams"
	"github.com/kobsio/kobs/pkg/satellite/api/users"
	"github.com/kobsio/kobs/pkg/satellite/middleware/tokenauth"
	"github.com/kobsio/kobs/pkg/satellite/middleware/user"
	"github.com/kobsio/kobs/pkg/satellite/plugins"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// Server is the interface of a satellite service, which provides the options to start and stop the underlying http
// server.
type Server interface {
	Start()
	Stop()
}

// server implements the Server interface.
type server struct {
	server *http.Server
}

// Start starts serving the satellite server.
func (s *server) Start() {
	log.Info(nil, "Satellite server started", zap.String("address", s.server.Addr))

	if err := s.server.ListenAndServe(); err != nil {
		if err != http.ErrServerClosed {
			log.Error(nil, "Satellite server died unexpected", zap.Error(err))
		}
	}
}

// Stop terminates the satellite server gracefully.
func (s *server) Stop() {
	log.Debug(nil, "Start shutdown of the satellite server")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	err := s.server.Shutdown(ctx)
	if err != nil {
		log.Error(nil, "Graceful shutdown of the satellite server failed", zap.Error(err))
	}
}

// New return a new satellite server. It creates the underlying http server, with the given name, address and token.
//
// We exclude the health check from all middlewares, because the health check just returns 200. Therefore we do not need
// our defined middlewares like request id, metrics, auth or loggin. This also makes it easier to analyze the logs in a
// Kubernetes cluster where the health check is called every x seconds, because we generate less logs.
func New(debugUsername, debugPassword, satelliteAddress, satelliteToken string, apiConfig api.Config, clustersClient clusters.Client, pluginsClient plugins.Client) (Server, error) {
	router := chi.NewRouter()
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"},
		AllowedHeaders: []string{"*"},
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
		r.Use(tokenauth.Handler(satelliteToken))
		r.Use(user.Handler())
		r.Use(httptracer.Handler("satellite"))
		r.Use(httpmetrics.Handler)
		r.Use(httplog.Handler)
		r.Use(render.SetContentType(render.ContentTypeJSON))

		r.Mount("/clusters", apiClusters.Mount(apiConfig.Clusters, clustersClient))
		r.Mount("/resources", resources.Mount(apiConfig.Resources, clustersClient))
		r.Mount("/applications", applications.Mount(apiConfig.Applications, clustersClient))
		r.Mount("/dashboards", dashboards.Mount(apiConfig.Dashboards, clustersClient))
		r.Mount("/teams", teams.Mount(apiConfig.Teams, clustersClient))
		r.Mount("/users", users.Mount(apiConfig.Users, clustersClient))
		r.Mount("/plugins", pluginsClient.Mount())
	})

	return &server{
		server: &http.Server{
			Addr:    satelliteAddress,
			Handler: router,
		},
	}, nil
}
