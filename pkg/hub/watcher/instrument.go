package watcher

import (
	"context"
	"time"

	"github.com/kobsio/kobs/pkg/log"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"go.uber.org/zap"
)

var (
	syncsTotalMetric = promauto.NewCounterVec(prometheus.CounterOpts{
		Namespace: "kobs",
		Name:      "watcher_syncs_total",
		Help:      "Number of sync requests processed by the watcher, partitioned by status and resource.",
	}, []string{"satellite", "status", "resource"})

	syncsSumMetric = promauto.NewSummaryVec(prometheus.SummaryOpts{
		Namespace:  "kobs",
		Name:       "watcher_syncs_duration_milliseconds",
		Help:       "Latency of sync requests processed by the watcher, partitioned by status and resource.",
		Objectives: map[float64]float64{0.5: 0.05, 0.9: 0.01, 0.95: 0.005, 0.99: 0.001},
	}, []string{"satellite", "status", "resource"})
)

func instrument(ctx context.Context, satellite, resource string, err error, startTime time.Time) {
	if err != nil {
		syncsTotalMetric.WithLabelValues(satellite, "error", resource).Inc()
		syncsSumMetric.WithLabelValues(satellite, "error", resource).Observe(float64(time.Since(startTime).Nanoseconds()) / 1000000)
		log.Error(ctx, "Could not get resources", zap.Error(err), zap.String("satellite", satellite), zap.String("resource", resource), zap.Time("endTime", time.Now()), zap.Duration("duration", time.Now().Sub(startTime)))
	} else {
		syncsTotalMetric.WithLabelValues(satellite, "success", resource).Inc()
		syncsSumMetric.WithLabelValues(satellite, "success", resource).Observe(float64(time.Since(startTime).Nanoseconds()) / 1000000)
		log.Debug(ctx, "Resources were saved", zap.String("satellite", satellite), zap.String("resource", resource), zap.Time("endTime", time.Now()), zap.Duration("duration", time.Now().Sub(startTime)))
	}
}
