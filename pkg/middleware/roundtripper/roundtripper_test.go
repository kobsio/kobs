package roundtripper

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
)

func testBasicAuth(w http.ResponseWriter, r *http.Request) {
	if username, password, ok := r.BasicAuth(); !ok || username != "admin" || password != "admin" {
		http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
		return
	}
}

func testTokenAuth(w http.ResponseWriter, r *http.Request) {
	if authHeader := r.Header.Get("Authorization"); authHeader != "Bearer admin" {
		http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
		return
	}
}

func TestBasicAuthTransport(t *testing.T) {
	roundTripper := DefaultRoundTripper

	roundTripper = BasicAuthTransport{
		Transport: roundTripper,
		Username:  "admin",
		Password:  "admin",
	}

	req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/", nil)
	roundTripper.RoundTrip(req)

	w := httptest.NewRecorder()
	testBasicAuth(w, req)

	resp := w.Result()
	require.Equal(t, http.StatusOK, resp.StatusCode)
}

func TestTokenAuthTransporter(t *testing.T) {
	roundTripper := DefaultRoundTripper

	roundTripper = TokenAuthTransporter{
		Transport: roundTripper,
		Token:     "admin",
	}

	req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/", nil)
	roundTripper.RoundTrip(req)

	w := httptest.NewRecorder()
	testTokenAuth(w, req)

	resp := w.Result()
	require.Equal(t, http.StatusOK, resp.StatusCode)
}
