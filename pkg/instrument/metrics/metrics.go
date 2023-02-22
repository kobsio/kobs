package metrics

import (
	"context"
	"net/http"
	"time"

	"github.com/kobsio/kobs/pkg/instrument/log"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.uber.org/zap"
)

// Config is the configuration required to create a new metrics server. Currently we only need the address where the
// server should listen on.
type Config struct {
	Address string `json:"address" env:"ADDRESS" default:":15222" help:"Set the address where the metrics server is listen on."`
}

// Server is the interface of a metrics service, which provides the options to start and stop the underlying http
// server.
type Server interface {
	Start()
	Stop()
}

// server implements the Server interface.
type server struct {
	*http.Server
}

// Start starts serving the metrics server.
func (s *server) Start() {
	log.Info(nil, "Metrics server started", zap.String("address", s.Addr))

	if err := s.ListenAndServe(); err != nil {
		if err != http.ErrServerClosed {
			log.Error(nil, "Metrics server died unexpected", zap.Error(err))
		}
	}
}

// Stop terminates the metrics server gracefully.
func (s *server) Stop() {
	log.Debug(nil, "Start shutdown of the metrics server")

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := s.Shutdown(ctx)
	if err != nil {
		log.Error(nil, "Graceful shutdown of the metrics server failed", zap.Error(err))
	}
}

// New return a new metrics server. The server listens on the provided address and is used to serve all generated
// Prometheus metrics.
//
// The metrics can be registered via the [github.com/prometheus/client_golang/prometheus/promauto] package:
//
//	var (
//		requestsTotalMetric = promauto.NewCounterVec(prometheus.CounterOpts{
//			Namespace: "kobs",
//			Name:      "requests_total",
//			Help:      "Number of HTTP requests processed, partitioned by status code, method and path.",
//		}, []string{"response_code", "request_method", "request_path"})
//	)
//
// To start the returned server the [Start] method should be called in a seperate goroutine.
//
// To perform a clean shutdown of the server the [Shutdown] method should be called before the program finished.
func New(config Config) Server {
	router := chi.NewRouter()
	router.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		render.JSON(w, r, nil)
	})
	router.Handle("/metrics", promhttp.Handler())

	return &server{
		&http.Server{
			Addr:    config.Address,
			Handler: router,
		},
	}
}
