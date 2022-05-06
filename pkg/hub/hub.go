package hub

import (
	"context"
	"net/http"
	"time"

	"github.com/kobsio/kobs/pkg/hub/api/plugins"
	userAuth "github.com/kobsio/kobs/pkg/hub/middleware/auth/user"
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

// Server implements the hub server. The hub server handles all the Kubernetes resource requests and delegates plugin
// requests to the correct satellite instance.
type Server struct {
	server *http.Server
}

// Start starts serving the hub server.
func (s *Server) Start() {
	log.Info(nil, "Hub server started", zap.String("address", s.server.Addr))

	if err := s.server.ListenAndServe(); err != nil {
		if err != http.ErrServerClosed {
			log.Error(nil, "Hub server died unexpected", zap.Error(err))
		}
	}
}

// Stop terminates the hub server gracefully.
func (s *Server) Stop() {
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
func New(hubAddress string, authEnabled bool, authHeaderUser, authHeaderTeams, authSessionToken string, authSessionInterval time.Duration, satellitesClient satellites.Client, storeClient store.Client) (*Server, error) {
	router := chi.NewRouter()
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type"},
	}))

	debug.MountRoutes(router)

	router.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		render.JSON(w, r, nil)
	})

	router.Route("/api", func(r chi.Router) {
		r.Use(middleware.RequestID)
		r.Use(middleware.Recoverer)
		r.Use(middleware.URLFormat)
		r.Use(metrics.Metrics)
		r.Use(httplog.Logger)
		r.Use(userAuth.Handler(authEnabled, authHeaderUser, authHeaderTeams, authSessionToken, authSessionInterval, nil))
		r.Use(render.SetContentType(render.ContentTypeJSON))

		r.Mount("/plugins", plugins.Mount(satellitesClient, storeClient))
	})

	return &Server{
		server: &http.Server{
			Addr:    hubAddress,
			Handler: router,
		},
	}, nil
}
