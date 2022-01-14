// Package httplog implements our custom http logger middleware for kobs based on zap.
package httplog

import (
	"fmt"
	"net/http"
	"time"

	"github.com/kobsio/kobs/pkg/log"

	"github.com/go-chi/chi/v5/middleware"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// Logger is a middleware that handles the request logging for chi via zap.
func Logger(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		wrw := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
		next.ServeHTTP(wrw, r)

		scheme := "http"
		if r.TLS != nil {
			scheme = "https"
		}

		fields := []zapcore.Field{
			zap.String("requestScheme", scheme),
			zap.String("requestProto", r.Proto),
			zap.String("requestMethod", r.Method),
			zap.String("requestAddr", r.RemoteAddr),
			zap.String("requestUserAgent", r.UserAgent()),
			zap.String("requestURI", fmt.Sprintf("%s://%s%s", scheme, r.Host, r.RequestURI)),
			zap.Int("responseStatus", wrw.Status()),
			zap.Int("responseBytes", wrw.BytesWritten()),
			zap.Float64("requestLatency", float64(time.Since(start).Nanoseconds())/1000000),
		}

		log.Info(r.Context(), "Request completed", fields...)
	}

	return http.HandlerFunc(fn)
}
