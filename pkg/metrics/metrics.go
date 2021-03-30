package metrics

import (
	"context"
	"net/http"
	"os"
	"time"

	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/sirupsen/logrus"
	flag "github.com/spf13/pflag"
)

var (
	log     = logrus.WithFields(logrus.Fields{"package": "metrics"})
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
	log.Infof("Metrics server listen on %s.", s.Addr)

	if err := s.ListenAndServe(); err != http.ErrServerClosed {
		log.WithError(err).Fatalf("Metrics server died unexpected.")
	}
}

// Stop terminates the metrics server gracefully.
func (s *Server) Stop() {
	log.Debugf("Start shutdown of the metrics server.")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := s.Shutdown(ctx); err != nil {
		log.WithError(err).Errorf("Gracefull shutdown of the metrics server failed.")
	}
}

// New return a new metrics server.
func New() *Server {
	router := http.NewServeMux()
	router.Handle("/metrics", promhttp.Handler())

	return &Server{
		&http.Server{
			Addr:    address,
			Handler: router,
		},
	}
}
