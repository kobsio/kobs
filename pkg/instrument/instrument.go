package instrument

import (
	"context"
	"fmt"
	"net/http"
	"runtime/debug"
	"strconv"
	"strings"

	"github.com/kobsio/kobs/pkg/instrument/log"

	"github.com/felixge/httpsnoop"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/propagation"
	semconv "go.opentelemetry.io/otel/semconv/v1.10.0"
	oteltrace "go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type ctxKeyRequestInfo int

const RequestInfoKey ctxKeyRequestInfo = 0

type RequestInfo struct {
	Metrics *httpsnoop.Metrics
}

var (
	reqCount = promauto.NewCounterVec(prometheus.CounterOpts{
		Namespace: "kobs",
		Name:      "http_requests_total",
		Help:      "Number of HTTP requests processed, partitioned by status code, method and path.",
	}, []string{"response_code", "request_method", "request_path"})

	reqDurationSum = promauto.NewSummaryVec(prometheus.SummaryOpts{
		Namespace:  "kobs",
		Name:       "http_request_duration_seconds",
		Help:       "Latency of HTTP requests processed, partitioned by status code, method and path.",
		Objectives: map[float64]float64{0.5: 0.05, 0.9: 0.01, 0.95: 0.005, 0.99: 0.001},
	}, []string{"response_code", "request_method", "request_path"})

	respSizeSum = promauto.NewSummaryVec(prometheus.SummaryOpts{
		Namespace:  "kobs",
		Name:       "http_response_size_bytes",
		Help:       "Size of HTTP responses, partitioned by status code, method and path.",
		Objectives: map[float64]float64{0.5: 0.05, 0.9: 0.01, 0.95: 0.005, 0.99: 0.001},
	}, []string{"response_code", "request_method", "request_path"})
)

func Handler() func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			var requestInfo = &RequestInfo{}
			r = r.WithContext(context.WithValue(r.Context(), RequestInfoKey, requestInfo))

			handler := handleInstrumentation(requestInfo)(next)

			requestInfo.Metrics = &httpsnoop.Metrics{
				Code: http.StatusOK,
			}
			requestInfo.Metrics.CaptureMetrics(w, func(ww http.ResponseWriter) {
				handler.ServeHTTP(ww, r)
			})
		})
	}
}

func handleInstrumentation(reqInfo *RequestInfo) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := otel.GetTextMapPropagator().Extract(r.Context(), propagation.HeaderCarrier(r.Header))
			ctx, span := otel.Tracer("http.request").Start(ctx, "http.request", oteltrace.WithSpanKind(oteltrace.SpanKindServer))
			defer span.End()

			defer func() {
				// In go-chi/chi, full route pattern could only be extracted once the request is executed
				// See: https://github.com/go-chi/chi/issues/150#issuecomment-278850733
				routeStr := strings.Join(chi.RouteContext(r.Context()).RoutePatterns, "")
				span.SetAttributes(semconv.HTTPServerAttributesFromHTTPRequest("http.server", routeStr, r)...)
				span.SetAttributes(semconv.NetAttributesFromHTTPRequest("tcp", r)...)
				span.SetAttributes(semconv.EndUserAttributesFromHTTPRequest(r)...)
				span.SetAttributes(otelhttp.ReadBytesKey.Int64(r.ContentLength))

				if requestID := middleware.GetReqID(ctx); requestID != "" {
					span.SetAttributes(attribute.Key("request.id").String(requestID))
				}

				span.SetName(fmt.Sprintf("%s:%s", r.Method, routeStr))

				if err := recover(); err != nil {
					span.SetAttributes(semconv.HTTPAttributesFromHTTPStatusCode(500)...)
					span.SetStatus(semconv.SpanStatusFromHTTPStatusCode(500))
					span.AddEvent("panic", oteltrace.WithAttributes(
						attribute.String("kind", "panic"),
						attribute.String("message", fmt.Sprintf("%v", err)),
						attribute.String("stack", string(debug.Stack())),
					))
					span.End()

					scheme := "http"
					if r.TLS != nil {
						scheme = "https"
					}

					fields := []zapcore.Field{
						zap.String("requestScheme", scheme),
						zap.String("requestProto", r.Proto),
						zap.String("requestMethod", r.Method),
						zap.String("requestAddr", r.RemoteAddr),
						zap.String("requestUserAgent", strings.Replace(strings.Replace(r.UserAgent(), "\n", "", -1), "\r", "", -1)),
						zap.String("requestURI", fmt.Sprintf("%s://%s%s", scheme, r.Host, r.RequestURI)),
						zap.Int("responseStatus", 500),
						zap.String("error", fmt.Sprintf("%v", err)),
					}

					log.Panic(r.Context(), "Request completed", fields...)

					panic(err)
				}
			}()

			r = r.WithContext(ctx)
			next.ServeHTTP(w, r)

			if reqInfo.Metrics != nil {
				path := chi.RouteContext(r.Context()).RoutePattern()
				status := reqInfo.Metrics.Code
				duration := reqInfo.Metrics.Duration
				written := reqInfo.Metrics.Written

				reqCount.WithLabelValues(strconv.Itoa(status), r.Method, path).Inc()
				reqDurationSum.WithLabelValues(strconv.Itoa(status), r.Method, path).Observe(duration.Seconds())
				respSizeSum.WithLabelValues(strconv.Itoa(status), r.Method, path).Observe(float64(written))

				span.SetAttributes(otelhttp.WroteBytesKey.Int64(written))
				span.SetAttributes(semconv.HTTPAttributesFromHTTPStatusCode(status)...)
				span.SetStatus(semconv.SpanStatusFromHTTPStatusCode(status))

				scheme := "http"
				if r.TLS != nil {
					scheme = "https"
				}

				fields := []zapcore.Field{
					zap.String("requestScheme", scheme),
					zap.String("requestProto", r.Proto),
					zap.String("requestMethod", r.Method),
					zap.String("requestAddr", r.RemoteAddr),
					zap.String("requestUserAgent", strings.Replace(strings.Replace(r.UserAgent(), "\n", "", -1), "\r", "", -1)),
					zap.String("requestURI", fmt.Sprintf("%s://%s%s", scheme, r.Host, r.RequestURI)),
					zap.Int("responseStatus", status),
				}

				if status >= 500 {
					log.Error(r.Context(), "Request completed", fields...)
				} else {
					log.Info(r.Context(), "Request completed", fields...)
				}
			}

		})
	}
}
