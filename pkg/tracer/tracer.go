package tracer

import (
	"context"
	"fmt"
	"time"

	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/version"

	"go.opentelemetry.io/contrib/propagators/b3"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/jaeger"
	"go.opentelemetry.io/otel/exporters/zipkin"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	tracesdk "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.10.0"
	"go.uber.org/zap"
)

// Client is the interface for our tracer. It contains the underlying tracer provider and a Shutdown method to perform a
// clean shutdown.
type Client interface {
	Shutdown()
}

type client struct {
	tracerProvider *tracesdk.TracerProvider
}

// Shutdown is used to gracefully shutdown the tracer provider, created during the setup. The gracefull shutdown can
// take at the maximum 10 seconds.
func (c *client) Shutdown() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err := c.tracerProvider.Shutdown(ctx)
	if err != nil {
		log.Error(nil, "Graceful shutdown of the tracer provider failed", zap.Error(err))
	}
}

// Setup is used to setup tracing for kobs. For that we are creating a new TracerProvider and register it as the global
// so any imported instrumentation will default to using it. If tracing is disabled the setup function returns nil.
//
// During the shutdown process of kobs the "Shutdown" method of the returned client must be called.
func Setup(enabled bool, service string, providerType string, url string) (Client, error) {
	if !enabled {
		return nil, nil
	}

	tp, err := newProvider(service, providerType, url)
	if err != nil {
		return nil, err
	}

	otel.SetTracerProvider(tp)

	b3 := b3.New(b3.WithInjectEncoding(b3.B3MultipleHeader | b3.B3SingleHeader))
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, b3))

	return &client{
		tracerProvider: tp,
	}, nil
}

// newProvider returns an OpenTelemetry TracerProvider configured to use the Jaeger or Zipkin exporter that will send
// spans to the provided url. The returned TracerProvider will also use a Resource configured with all the information
// about the application.
func newProvider(service string, providerType string, url string) (*tracesdk.TracerProvider, error) {
	var exp tracesdk.SpanExporter
	var err error

	if service == "" || url == "" {
		return nil, fmt.Errorf("service and provider url are required")
	}

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

	defaultResource, err := resource.New(
		context.Background(),
		resource.WithAttributes(
			semconv.ServiceNameKey.String(service),
			semconv.ServiceVersionKey.String(version.Version),
		),
		resource.WithContainer(),
		resource.WithContainerID(),
		resource.WithHost(),
		resource.WithOS(),
		resource.WithProcessExecutableName(),
		resource.WithProcessExecutablePath(),
		resource.WithProcessOwner(),
		resource.WithProcessPID(),
		resource.WithProcessRuntimeDescription(),
		resource.WithProcessRuntimeName(),
		resource.WithProcessRuntimeVersion(),
		resource.WithSchemaURL(semconv.SchemaURL),
		resource.WithTelemetrySDK(),
	)
	if err != nil {
		return nil, err
	}

	return tracesdk.NewTracerProvider(
		tracesdk.WithBatcher(exp),
		tracesdk.WithResource(defaultResource),
	), nil
}
