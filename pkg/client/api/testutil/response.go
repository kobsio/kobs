package testutil

import (
	"io"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
)

func AssertEqualStatus(t *testing.T, want int, r *httptest.ResponseRecorder) {
	statusMessage := ""
	if r.Code != want {
		bytes, _ := io.ReadAll(r.Body)
		statusMessage = string(bytes)
	}
	require.Equalf(t, want, r.Code, "body: %s", statusMessage)
}

func AssertJSONEq(t *testing.T, want string, r *httptest.ResponseRecorder) {
	bytes, err := io.ReadAll(r.Body)
	require.NoError(t, err)
	require.JSONEq(t, want, string(bytes))
}
