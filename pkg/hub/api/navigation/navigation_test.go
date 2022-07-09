package navigation

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/require"
)

func TestGetNavigationGroups(t *testing.T) {
	for _, tt := range []struct {
		name               string
		config             Config
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name:               "not configured",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
		},
		{
			name:               "configured",
			config:             Config{Groups: []group{{Title: "Cluster", Items: []item{{Title: "Overview"}}}}},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"title\":\"Cluster\",\"items\":[{\"title\":\"Overview\",\"childs\":null,\"dashboard\":{\"satellite\":\"\",\"cluster\":\"\",\"namespace\":\"\",\"name\":\"\",\"placeholders\":null}}]}]\n",
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			router := Router{chi.NewRouter(), tt.config}

			req, _ := http.NewRequest(http.MethodGet, "/groups", nil)
			rctx := chi.NewRouteContext()
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			w := httptest.NewRecorder()
			router.getNavigationGroups(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestMount(t *testing.T) {
	router := Mount(Config{Groups: []group{}})
	require.NotNil(t, router)
}
