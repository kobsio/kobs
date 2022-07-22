package httpmetrics

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	requestsTotalMetric = promauto.NewCounterVec(prometheus.CounterOpts{
		Namespace: "kobs",
		Name:      "requests_total",
		Help:      "Number of HTTP requests processed, partitioned by status code, method and path.",
	}, []string{"response_code", "request_method", "request_path"})

	requestDurationMetric = promauto.NewSummaryVec(prometheus.SummaryOpts{
		Namespace:  "kobs",
		Name:       "request_duration_seconds",
		Help:       "Latency of HTTP requests processed, partitioned by status code, method and path.",
		Objectives: map[float64]float64{0.5: 0.05, 0.9: 0.01, 0.95: 0.005, 0.99: 0.001},
	}, []string{"response_code", "request_method", "request_path"})

	requestSizeMetric = promauto.NewSummaryVec(prometheus.SummaryOpts{
		Namespace:  "kobs",
		Name:       "request_size_bytes",
		Help:       "Latency of HTTP requests processed, partitioned by status code, method and path.",
		Objectives: map[float64]float64{0.5: 0.05, 0.9: 0.01, 0.95: 0.005, 0.99: 0.001},
	}, []string{"response_code", "request_method", "request_path"})
)

// Handler is a middleware that handles the Prometheus metrics for kobs and chi.
func Handler(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		defer func() {
			if err := recover(); err != nil {
				routeStr := strings.Join(chi.RouteContext(r.Context()).RoutePatterns, "")
				requestsTotalMetric.WithLabelValues(strconv.Itoa(http.StatusInternalServerError), r.Method, routeStr).Inc()
				requestDurationMetric.WithLabelValues(strconv.Itoa(http.StatusInternalServerError), r.Method, routeStr).Observe(time.Since(start).Seconds())
				requestSizeMetric.WithLabelValues(strconv.Itoa(http.StatusInternalServerError), r.Method, routeStr).Observe(0)

				panic(err)
			}
		}()

		wrw := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
		next.ServeHTTP(wrw, r)

		routeStr := strings.Join(chi.RouteContext(r.Context()).RoutePatterns, "")
		requestsTotalMetric.WithLabelValues(strconv.Itoa(wrw.Status()), r.Method, routeStr).Inc()
		requestDurationMetric.WithLabelValues(strconv.Itoa(wrw.Status()), r.Method, routeStr).Observe(time.Since(start).Seconds())
		requestSizeMetric.WithLabelValues(strconv.Itoa(wrw.Status()), r.Method, routeStr).Observe(float64(wrw.BytesWritten()))
	}

	return http.HandlerFunc(fn)
}
