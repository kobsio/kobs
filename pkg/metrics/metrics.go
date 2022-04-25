package metrics

import (
	"context"
	"net/http"
	"time"

	"github.com/kobsio/kobs/pkg/log"

	"github.com/go-chi/chi/v5"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.uber.org/zap"
)

// Server implements the metrics server. The metrics server is used to serve Prometheus metrics for kobs.
type Server struct {
	*http.Server
}

// Start starts serving the metrics server.
func (s *Server) Start() {
	log.Info(nil, "Metrics server started", zap.String("address", s.Addr))

	if err := s.ListenAndServe(); err != nil {
		if err != http.ErrServerClosed {
			log.Error(nil, "Metrics server died unexpected", zap.Error(err))
		}
	}
}

// Stop terminates the metrics server gracefully.
func (s *Server) Stop() {
	log.Debug(nil, "Start shutdown of the metrics server")

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	err := s.Shutdown(ctx)
	if err != nil {
		log.Error(nil, "Graceful shutdown of the metrics server failed", zap.Error(err))
	}
}

// New return a new metrics server.
func New(address string) *Server {
	router := chi.NewRouter()
	router.Handle("/metrics", promhttp.Handler())

	return &Server{
		&http.Server{
			Addr:    address,
			Handler: router,
		},
	}
}
