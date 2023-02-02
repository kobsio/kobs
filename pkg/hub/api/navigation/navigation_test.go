package navigation

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/kobsio/kobs/pkg/utils"
	"github.com/stretchr/testify/require"
)

func TestGetNavigationGroups(t *testing.T) {
	t.Run("not configured", func(t *testing.T) {
		router := Router{chi.NewRouter(), Config{}}

		ctx := context.WithValue(context.Background(), chi.RouteCtxKey, chi.NewRouteContext())
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/groups", nil)

		w := httptest.NewRecorder()
		router.getNavigationGroups(w, req)

		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t, "null", w)
	})

	t.Run("configured", func(t *testing.T) {
		router := Router{chi.NewRouter(), Config{Groups: []group{{Title: "Cluster", Items: []item{{Title: "Overview"}}}}}}

		ctx := context.WithValue(context.Background(), chi.RouteCtxKey, chi.NewRouteContext())
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/groups", nil)

		w := httptest.NewRecorder()
		router.getNavigationGroups(w, req)

		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t, `[{"title":"Cluster","items":[{"title":"Overview","childs":null,"dashboard":{"satellite":"","cluster":"","namespace":"","name":"","placeholders":null}}]}]`, w)
	})
}

func TestMount(t *testing.T) {
	router := Mount(Config{Groups: []group{}})
	require.NotNil(t, router)
}
