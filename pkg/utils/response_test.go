package utils

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestAssertStatusEq(t *testing.T) {
	t.Run("checks if the status matches the status in the response writer", func(t *testing.T) {
		handle := func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusBadRequest)
		}

		r := httptest.NewRequest(http.MethodGet, "/resource", nil)
		w := httptest.NewRecorder()
		handle(w, r)

		AssertStatusEq(t, http.StatusBadRequest, w)
	})
}

func TestAssertJSONEq(t *testing.T) {
	t.Run("checks if the json in the response matches the given json", func(t *testing.T) {
		handle := func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			err := json.NewEncoder(w).Encode(struct {
				OK bool `json:"ok"`
			}{true})
			require.NoError(t, err)
		}

		r := httptest.NewRequest(http.MethodGet, "/resource", nil)
		w := httptest.NewRecorder()
		handle(w, r)

		AssertJSONEq(t, `{ "ok": true }`, w)
	})
}
