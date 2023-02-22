package watcher

import (
	"context"
	"time"

	"github.com/kobsio/kobs/pkg/instrument/log"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

var (
	syncsTotalMetric = promauto.NewCounterVec(prometheus.CounterOpts{
		Namespace: "kobs",
		Name:      "watcher_syncs_total",
		Help:      "Number of sync requests processed by the watcher, partitioned by status and resource.",
	}, []string{"cluster", "status", "resource"})

	syncsSumMetric = promauto.NewSummaryVec(prometheus.SummaryOpts{
		Namespace:  "kobs",
		Name:       "watcher_syncs_duration_milliseconds",
		Help:       "Latency of sync requests processed by the watcher, partitioned by status and resource.",
		Objectives: map[float64]float64{0.5: 0.05, 0.9: 0.01, 0.95: 0.005, 0.99: 0.001},
	}, []string{"cluster", "status", "resource"})
)

// instrument is a small helper function to generate metrics and logs for the watcher function. The helper is
// responsible for settings a metrics with the total number of syncs and with the sync duration. Both metrics are
// containing the following labels:
//   - cluster: The name of the cluster which was synced
//   - status: The status if the sync was successfull or not
//   - resource: The name of the resource which was synced
//
// Next to the metrics the this helper function also writes a log line with the above information.
func instrument(ctx context.Context, span trace.Span, cluster, resource string, err error, length int, startTime time.Time) {
	if err != nil {
		syncsTotalMetric.WithLabelValues(cluster, "error", resource).Inc()
		syncsSumMetric.WithLabelValues(cluster, "error", resource).Observe(float64(time.Since(startTime).Nanoseconds()) / 1000000)
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		log.Error(ctx, "Could not get resources", zap.Error(err), zap.String("cluster", cluster), zap.String("resource", resource), zap.Int("count", length), zap.Time("endTime", time.Now()), zap.Duration("duration", time.Now().Sub(startTime)))

	} else {
		syncsTotalMetric.WithLabelValues(cluster, "success", resource).Inc()
		syncsSumMetric.WithLabelValues(cluster, "success", resource).Observe(float64(time.Since(startTime).Nanoseconds()) / 1000000)
		log.Debug(ctx, "Resources were saved", zap.String("cluster", cluster), zap.String("resource", resource), zap.Int("count", length), zap.Time("endTime", time.Now()), zap.Duration("duration", time.Now().Sub(startTime)))
	}
}
