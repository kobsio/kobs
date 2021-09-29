package metrics

import (
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5/middleware"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	reqMetric = promauto.NewCounterVec(prometheus.CounterOpts{
		Namespace: "kobs",
		Name:      "chi_requests_total",
		Help:      "Number of HTTP requests processed, partitioned by status code, method and path.",
	}, []string{"response_code", "request_method", "request_path"})

	sumMetric = promauto.NewSummaryVec(prometheus.SummaryOpts{
		Namespace:  "kobs",
		Name:       "chi_request_duration_milliseconds",
		Help:       "Latency of HTTP requests processed, partitioned by status code, method and path.",
		Objectives: map[float64]float64{0.5: 0.05, 0.9: 0.01, 0.95: 0.005, 0.99: 0.001},
	}, []string{"response_code", "request_method", "request_path"})
)

// Metrics is a middleware that handles the Prometheus metrics for kobs and chi.
func Metrics(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		wrw := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
		next.ServeHTTP(wrw, r)

		reqMetric.WithLabelValues(strconv.Itoa(wrw.Status()), r.Method, r.URL.Path).Inc()
		sumMetric.WithLabelValues(strconv.Itoa(wrw.Status()), r.Method, r.URL.Path).Observe(float64(time.Since(start).Nanoseconds()) / 1000000)
	}

	return http.HandlerFunc(fn)
}
