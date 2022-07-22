package user

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/stretchr/testify/require"
)

func TestHandler(t *testing.T) {
	for _, tt := range []struct {
		name               string
		expectedStatusCode int
		expectedBody       string
		prepareRequest     func(r *http.Request)
	}{
		{
			name:               "x-kobs-user header missing",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"x-kobs-user header is missing or invalid\"}\n",
			prepareRequest:     func(r *http.Request) {},
		},
		{
			name:               "x-kobs-user header invalid",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"x-kobs-user header is missing or invalid\"}\n",
			prepareRequest: func(r *http.Request) {
				r.Header.Add("x-kobs-user", "{\"email\":{\"foo\":\"bar\"}}")
			},
		},
		{
			name:               "user set from x-kobs-user header",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepareRequest: func(r *http.Request) {
				r.Header.Add("x-kobs-user", "{\"email\":\"user1@kobs.io\"}")
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			router := chi.NewRouter()
			router.Use(Handler())
			router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
				render.JSON(w, r, nil)
			})

			req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/", nil)
			tt.prepareRequest(req)

			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}
