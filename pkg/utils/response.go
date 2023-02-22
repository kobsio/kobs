package utils

import (
	"io"
	"io/ioutil"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
)

func AssertStatusEq(t *testing.T, w *httptest.ResponseRecorder, want int) {
	t.Helper()
	statusMessage := ""
	if w.Code != want {
		bytes, _ := io.ReadAll(w.Body)
		statusMessage = string(bytes)
	}
	require.Equalf(t, want, w.Code, "body: %s", statusMessage)
}

func AssertJSONEq(t *testing.T, w *httptest.ResponseRecorder, want string) {
	t.Helper()
	bytes, err := io.ReadAll(w.Body)
	require.NoError(t, err)
	require.JSONEq(t, want, string(bytes))
}

func AssertJSONSnapshotEq(t *testing.T, w *httptest.ResponseRecorder, path string) {
	t.Helper()
	bytes, err := io.ReadAll(w.Body)
	require.NoError(t, err)
	wantBytes, err := ioutil.ReadFile(path)
	require.NoError(t, err)
	require.JSONEq(t, string(wantBytes), string(bytes))
}
