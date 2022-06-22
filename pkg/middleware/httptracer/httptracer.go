package httptracer

import (
	"fmt"
	"net/http"
	"strings"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"

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

	r = r.WithContext(ctx)
	wrw := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
	tw.handler.ServeHTTP(wrw, r)

	// In go-chi/chi, full route pattern could only be extracted once the request is executed
	// See: https://github.com/go-chi/chi/issues/150#issuecomment-278850733
	routeStr := strings.Join(chi.RouteContext(r.Context()).RoutePatterns, "")
	attrs := semconv.HTTPAttributesFromHTTPStatusCode(wrw.Status())
	attrs = append(attrs, semconv.NetAttributesFromHTTPRequest("tcp", r)...)
	attrs = append(attrs, semconv.EndUserAttributesFromHTTPRequest(r)...)
	attrs = append(attrs, semconv.HTTPServerAttributesFromHTTPRequest(tw.serverName, routeStr, r)...)
	attrs = append(attrs, otelhttp.WroteBytesKey.Int(wrw.BytesWritten()))
	attrs = append(attrs, otelhttp.ReadBytesKey.Int64(r.ContentLength))

	if requestID := middleware.GetReqID(ctx); requestID != "" {
		attrs = append(attrs, attribute.Key("request.id").String(requestID))
	}
	if user, _ := authContext.GetUser(ctx); user != nil {
		attrs = append(attrs, attribute.Key("user.email").String(user.Email))
	}

	span.SetAttributes(attrs...)
	span.SetName(fmt.Sprintf("%s:%s", r.Method, routeStr))

	spanStatus, spanMessage := semconv.SpanStatusFromHTTPStatusCode(wrw.Status())
	span.SetStatus(spanStatus, spanMessage)
}
