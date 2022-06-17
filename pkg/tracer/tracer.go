package tracer

import (
	"github.com/kobsio/kobs/pkg/version"

	"go.opentelemetry.io/contrib/propagators/b3"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/jaeger"
	"go.opentelemetry.io/otel/exporters/zipkin"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	tracesdk "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.10.0"
)

// newProvider returns an OpenTelemetry TracerProvider configured to use the Jaeger or Zipkin exporter that will send
// spans to the provided url. The returned TracerProvider will also use a Resource configured with all the information
// about the application.
func newProvider(service string, providerType string, url string) (*tracesdk.TracerProvider, error) {
	var exp tracesdk.SpanExporter
	var err error

	if providerType == "zipkin" {
		exp, err = zipkin.New(url)
		if err != nil {
			return nil, err
		}
	} else {
		exp, err = jaeger.New(jaeger.WithCollectorEndpoint(jaeger.WithEndpoint(url)))
		if err != nil {
			return nil, err
		}
	}

	return tracesdk.NewTracerProvider(
		tracesdk.WithBatcher(exp),
		tracesdk.WithResource(resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceNameKey.String(service),
			semconv.ServiceVersionKey.String(version.Version),
		)),
	), nil
}

// Setup is used to setup tracing for kobs. For that we are creating a new TracerProvider and register it as the global
// so any imported instrumentation will default to using it.
func Setup(service string, providerType string, url string) error {
	tp, err := newProvider(service, providerType, url)
	if err != nil {
		return err
	}

	otel.SetTracerProvider(tp)

	b3 := b3.New(b3.WithInjectEncoding(b3.B3MultipleHeader | b3.B3SingleHeader))
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, b3))

	return nil
}
