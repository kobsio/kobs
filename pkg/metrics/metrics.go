package metrics

import (
	"context"
	"net/http"
	"os"
	"time"

	"github.com/kobsio/kobs/pkg/log"

	"github.com/go-chi/chi/v5"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	flag "github.com/spf13/pflag"
	"go.uber.org/zap"
)

var (
	address string
)

// init is used to define all flags, which are needed for the metrics server. Currently this is only the address, where
// the metrics server should listen on.
func init() {
	defaultAddress := ":15221"
	if os.Getenv("KOBS_METRICS_ADDRESS") != "" {
		defaultAddress = os.Getenv("KOBS_METRICS_ADDRESS")
	}

	flag.StringVar(&address, "metrics.address", defaultAddress, "The address, where the Prometheus metrics are served.")
}

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
func New() *Server {
	router := chi.NewRouter()
	router.Handle("/metrics", promhttp.Handler())

	return &Server{
		&http.Server{
			Addr:    address,
			Handler: router,
		},
	}
}
