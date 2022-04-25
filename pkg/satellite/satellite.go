package satellite

import (
	"context"
	"net/http"
	"time"

	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/debug"
	"github.com/kobsio/kobs/pkg/middleware/httplog"
	"github.com/kobsio/kobs/pkg/middleware/metrics"
	"github.com/kobsio/kobs/pkg/satellite/middleware/tokenauth"
	"github.com/kobsio/kobs/pkg/satellite/middleware/user"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
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

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
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
func New(satelliteAddress, satelliteToken string, clustersRouter chi.Router, pluginsRouter chi.Router) (Server, error) {
	router := chi.NewRouter()
	debug.MountRoutes(router)

	router.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		render.JSON(w, r, nil)
	})

	router.Route("/api", func(r chi.Router) {
		r.Use(middleware.RequestID)
		r.Use(middleware.Recoverer)
		r.Use(middleware.URLFormat)
		r.Use(tokenauth.Handler(satelliteToken))
		r.Use(user.Handler())
		r.Use(metrics.Metrics)
		r.Use(httplog.Logger)
		r.Use(render.SetContentType(render.ContentTypeJSON))

		r.Mount("/clusters", clustersRouter)
		r.Mount("/plugins", pluginsRouter)
	})

	return &server{
		server: &http.Server{
			Addr:    satelliteAddress,
			Handler: router,
		},
	}, nil
}
