package tokenauth

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
			name:               "should return error when authorization header is missing",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"errors\":[\"Unauthorized\"]}\n",
			prepareRequest:     func(r *http.Request) {},
		},
		{
			name:               "should return error when authorization header contains wrong token",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"errors\":[\"Unauthorized\"]}\n",
			prepareRequest: func(r *http.Request) {
				r.Header.Add("Authorization", "Bearer faketoken")
			},
		},
		{
			name:               "should succeed",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepareRequest: func(r *http.Request) {
				r.Header.Add("Authorization", "Bearer testtoken")
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			router := chi.NewRouter()
			router.Use(Handler("testtoken"))
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
