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

// Handler is a middleware that handles the request logging for chi via zap.
func Handler(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		scheme := "http"
		if r.TLS != nil {
			scheme = "https"
		}

		defer func() {
			if err := recover(); err != nil {
				fields := []zapcore.Field{
					zap.String("requestScheme", scheme),
					zap.String("requestProto", r.Proto),
					zap.String("requestMethod", r.Method),
					zap.String("requestAddr", r.RemoteAddr),
					zap.String("requestUserAgent", r.UserAgent()),
					zap.String("requestURI", fmt.Sprintf("%s://%s%s", scheme, r.Host, r.RequestURI)),
					zap.Int("responseStatus", 500),
					zap.Float64("requestLatency", float64(time.Since(start).Nanoseconds())/1000000),
					zap.String("error", fmt.Sprintf("%v", err)),
				}

				log.Panic(r.Context(), "Request completed", fields...)
				panic(err)
			}
		}()

		wrw := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
		next.ServeHTTP(wrw, r)

		status := wrw.Status()
		if status == 0 {
			status = http.StatusOK
		}

		fields := []zapcore.Field{
			zap.String("requestScheme", scheme),
			zap.String("requestProto", r.Proto),
			zap.String("requestMethod", r.Method),
			zap.String("requestAddr", r.RemoteAddr),
			zap.String("requestUserAgent", r.UserAgent()),
			zap.String("requestURI", fmt.Sprintf("%s://%s%s", scheme, r.Host, r.RequestURI)),
			zap.Int("responseStatus", status),
			zap.Int("responseBytes", wrw.BytesWritten()),
			zap.Float64("requestLatency", float64(time.Since(start).Nanoseconds())/1000000),
		}

		if status >= 500 {
			log.Error(r.Context(), "Request completed", fields...)
		} else {
			log.Info(r.Context(), "Request completed", fields...)
		}
	}

	return http.HandlerFunc(fn)
}
