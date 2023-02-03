package utils

import (
	"io"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
)

func AssertStatusEq(t *testing.T, want int, r *httptest.ResponseRecorder) {
	t.Helper()
	statusMessage := ""
	if r.Code != want {
		bytes, _ := io.ReadAll(r.Body)
		statusMessage = string(bytes)
	}
	require.Equalf(t, want, r.Code, "body: %s", statusMessage)
}

func AssertJSONEq(t *testing.T, want string, r *httptest.ResponseRecorder) {
	t.Helper()
	bytes, err := io.ReadAll(r.Body)
	require.NoError(t, err)
	require.JSONEq(t, want, string(bytes))
}