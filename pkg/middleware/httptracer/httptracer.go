package httptracer

import (
	"fmt"
	"net/http"
	"runtime/debug"
	"strings"

	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/propagation"
	semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
	oteltrace "go.opentelemetry.io/otel/trace"
)

type traceware struct {
	serverName  string
	tracer      oteltrace.Tracer
	propagators propagation.TextMapPropagator
	handler     http.Handler
}

// Handler sets up a handler to start tracing the incoming requests. The serverName parameter should describe the name
// of the (virtual) server handling the request.
func Handler(serverName string) func(next http.Handler) http.Handler {
	return func(handler http.Handler) http.Handler {
		return traceware{
			serverName:  serverName,
			tracer:      otel.Tracer("http.request"),
			propagators: otel.GetTextMapPropagator(),
			handler:     handler,
		}
	}
}

// ServeHTTP implements the http.Handler interface. It does the actual tracing of the request.
func (tw traceware) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := tw.propagators.Extract(r.Context(), propagation.HeaderCarrier(r.Header))
	ctx, span := tw.tracer.Start(ctx, "http.request", oteltrace.WithSpanKind(oteltrace.SpanKindServer))
	defer span.End()

	defer func() {
		// In go-chi/chi, full route pattern could only be extracted once the request is executed
		// See: https://github.com/go-chi/chi/issues/150#issuecomment-278850733
		routeStr := strings.Join(chi.RouteContext(r.Context()).RoutePatterns, "")
		span.SetAttributes(semconv.HTTPServerAttributesFromHTTPRequest(tw.serverName, routeStr, r)...)
		span.SetAttributes(semconv.NetAttributesFromHTTPRequest("tcp", r)...)
		span.SetAttributes(semconv.EndUserAttributesFromHTTPRequest(r)...)
		span.SetAttributes(otelhttp.ReadBytesKey.Int64(r.ContentLength))

		if requestID := middleware.GetReqID(ctx); requestID != "" {
			span.SetAttributes(attribute.Key("request.id").String(requestID))
		}

		if user, _ := authContext.GetUser(ctx); user != nil {
			span.SetAttributes(attribute.Key("user.email").String(user.Email))
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

			panic(err)
		}
	}()

	r = r.WithContext(ctx)
	wrw := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
	tw.handler.ServeHTTP(wrw, r)

	status := wrw.Status()
	if status == 0 {
		status = http.StatusOK
	}

	span.SetAttributes(otelhttp.WroteBytesKey.Int(wrw.BytesWritten()))
	span.SetAttributes(semconv.HTTPAttributesFromHTTPStatusCode(status)...)
	span.SetStatus(semconv.SpanStatusFromHTTPStatusCode(status))
}
