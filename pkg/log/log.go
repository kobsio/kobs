// Package log implements some utilities for our logging. E.g. it provides an utility for parsing the specified log
// level and a context aware logging function, which can be used to extend the list of fields for a log line, with the
// fields from the passed in context.
package log

import (
	"context"

	authContext "github.com/kobsio/kobs/pkg/middleware/auth/user/context"

	"github.com/go-chi/chi/v5/middleware"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// Key to use when setting additional log fields.
type ctxKeyLog int

// LogKey is the key that holds the log fields in a context.
const LogKey ctxKeyLog = 0

// ContextWithValue takes an existing context and adds all the provided fields to the context so that they will then be
// logged for each line where the returned context is used.
// In the first step we have to check if the context already contains some log fields. If this is the case, we append
// the provided fields, so that the new context contains all fields.
func ContextWithValue(ctx context.Context, fields ...zapcore.Field) context.Context {
	if ctxFields, ok := ctx.Value(LogKey).([]zapcore.Field); ok {
		fields = append(fields, ctxFields...)
	}

	return context.WithValue(ctx, LogKey, fields)
}

// getFields appends all fields from the provided context like the request id, the user id and the fields set via the
// ContextWithValue() function.
func getFields(ctx context.Context, fields ...zapcore.Field) []zapcore.Field {
	if ctx == nil {
		return fields
	}

	if requestID := middleware.GetReqID(ctx); requestID != "" {
		fields = append(fields, zap.String("requestID", requestID))
	}

	if user, _ := authContext.GetUser(ctx); user != nil {
		fields = append(fields, zap.String("userID", user.ID))
	}

	if ctxFields, ok := ctx.Value(LogKey).([]zapcore.Field); ok {
		fields = append(fields, ctxFields...)
	}

	return fields
}

// Debug is a wrapper around the zap.L().Debug() function, which adds all fields from the passed context to the log
// message.
func Debug(ctx context.Context, msg string, fields ...zapcore.Field) {
	fields = getFields(ctx, fields...)
	zap.L().Debug(msg, fields...)
}

// Info is a wrapper around the zap.L().Info() function, which adds all fields from the passed context to the log
// message.
func Info(ctx context.Context, msg string, fields ...zapcore.Field) {
	fields = getFields(ctx, fields...)
	zap.L().Info(msg, fields...)
}

// Warn is a wrapper around the zap.L().Warn() function, which adds all fields from the passed context to the log
// message.
func Warn(ctx context.Context, msg string, fields ...zapcore.Field) {
	fields = getFields(ctx, fields...)
	zap.L().Warn(msg, fields...)
}

// Error is a wrapper around the zap.L().Error() function, which adds all fields from the passed context to the log
// message.
func Error(ctx context.Context, msg string, fields ...zapcore.Field) {
	fields = getFields(ctx, fields...)
	zap.L().Error(msg, fields...)
}

// Fatal is a wrapper around the zap.L().Fatal() function, which adds all fields from the passed context to the log
// message.
func Fatal(ctx context.Context, msg string, fields ...zapcore.Field) {
	fields = getFields(ctx, fields...)
	zap.L().Fatal(msg, fields...)
}

// Panic is a wrapper around the zap.L().Panic() function, which adds all fields from the passed context to the log
// message.
func Panic(ctx context.Context, msg string, fields ...zapcore.Field) {
	fields = getFields(ctx, fields...)
	zap.L().Panic(msg, fields...)
}
