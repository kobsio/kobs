package log

import (
	"context"
	"testing"

	"github.com/go-chi/chi/v5/middleware"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
)

func TestContextWithValue(t *testing.T) {
	ctx1 := context.Background()

	ctx2 := ContextWithValue(ctx1, zap.String("foo", "bar"))
	require.Equal(t, context.WithValue(ctx1, LogKey, []zap.Field{zap.String("foo", "bar")}), ctx2)

	ctx3 := ContextWithValue(ctx2, zap.String("hello", "world"))
	require.Equal(t, context.WithValue(ctx2, LogKey, []zap.Field{zap.String("hello", "world"), zap.String("foo", "bar")}), ctx3)
}

func TestGetFields(t *testing.T) {
	var ctx1 context.Context

	fields := getFields(ctx1, zap.String("foo", "bar"))
	require.Equal(t, []zap.Field{zap.String("foo", "bar")}, fields)

	ctx1 = context.Background()

	ctx1 = context.WithValue(ctx1, middleware.RequestIDKey, "requestID")
	// ctx1 = context.WithValue(ctx1, authContext.UserKey, authContext.User{Email: "user1@kobs.io"})
	fields = getFields(ctx1, zap.String("foo", "bar"))
	require.Equal(t, []zap.Field{zap.String("foo", "bar"), zap.String("requestID", "requestID"), zap.String("userEmail", "user1@kobs.io")}, fields)

	ctx2 := ContextWithValue(ctx1, zap.String("hello", "world"))
	fields = getFields(ctx2, zap.String("foo", "bar"))
	require.Equal(t, []zap.Field{zap.String("foo", "bar"), zap.String("requestID", "requestID"), zap.String("userEmail", "user1@kobs.io"), zap.String("hello", "world")}, fields)
}

func TestDebug(t *testing.T) {
	ctx := context.Background()

	require.NotPanics(t, func() {
		Debug(ctx, "Test Debug Log")
	})
}

func TestInfo(t *testing.T) {
	ctx := context.Background()

	require.NotPanics(t, func() {
		Info(ctx, "Test Info Log")
	})
}

func TestWarn(t *testing.T) {
	ctx := context.Background()

	require.NotPanics(t, func() {
		Warn(ctx, "Test Warn Log")
	})
}

func TestError(t *testing.T) {
	ctx := context.Background()

	require.NotPanics(t, func() {
		Error(ctx, "Test Error Log")
	})
}

func TestPanic(t *testing.T) {
	ctx := context.Background()

	require.Panics(t, func() {
		Panic(ctx, "Test Panic Log")
	})
}
