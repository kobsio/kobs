package api

import (
	"context"
	"net/http"
	"time"

	"github.com/kobsio/kobs/pkg/hub/auth"
	"github.com/kobsio/kobs/pkg/hub/clusters"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/hub/middleware/recoverer"
	"github.com/kobsio/kobs/pkg/instrument"
	"github.com/kobsio/kobs/pkg/instrument/log"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type Config struct {
	Address string `env:"ADDRESS" default:":15220" help:"The address where the hub API should listen on."`
}

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

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
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
func New(config Config, authClient auth.Client, clustersClient clusters.Client, dbClient db.Client) (Server, error) {
	router := chi.NewRouter()
	router.Use(recoverer.Handler)
	router.Use(middleware.RequestID)
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"},
		AllowedHeaders: []string{"*"},
	}))

	router.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		render.JSON(w, r, nil)
	})

	router.Route("/api", func(r chi.Router) {
		r.Use(instrument.Handler())
		r.Use(render.SetContentType(render.ContentTypeJSON))

		r.Mount("/auth", authClient.Mount())

		r.Group(func(r chi.Router) {
			r.Use(authClient.MiddlewareHandler)
		})

	})

	return &server{
		server: &http.Server{
			Addr:    config.Address,
			Handler: router,
		},
	}, nil
}
