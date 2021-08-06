package metrics

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5/middleware"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	reqs = promauto.NewCounterVec(prometheus.CounterOpts{
		Namespace: "kobs",
		Name:      "chi_requests_total",
		Help:      "Number of HTTP requests processed, partitioned by status code, method and path.",
	}, []string{"code", "method", "path"})

	latency = promauto.NewHistogramVec(prometheus.HistogramOpts{
		Namespace: "kobs",
		Name:      "chi_request_duration_milliseconds",
		Help:      "Latency of HTTP requests processed, partitioned by status code, method and path.",
		Buckets:   []float64{100, 500, 1000, 5000},
	}, []string{"code", "method", "path"})
)

// Metrics is a middleware that handles the Prometheus metrics for kobs and chi.
func Metrics(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		wrw := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
		next.ServeHTTP(wrw, r)

		reqs.WithLabelValues(http.StatusText(wrw.Status()), r.Method, r.URL.Path).Inc()
		latency.WithLabelValues(http.StatusText(wrw.Status()), r.Method, r.URL.Path).Observe(float64(time.Since(start).Nanoseconds()) / 1000000)
	}

	return http.HandlerFunc(fn)
}
