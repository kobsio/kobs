package plugins

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/api/plugins/plugin"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/require"
)

func TestGetPlugins(t *testing.T) {
	router := Router{
		chi.NewRouter(),
		&plugin.Plugins{
			{
				Name:        "applications",
				DisplayName: "Applications",
				Description: "Monitor your Kubernetes workloads.",
				Home:        true,
				Type:        "applications",
			},
			{
				Name:        "resources",
				DisplayName: "Resources",
				Description: "View and edit Kubernetes resources.",
				Type:        "resources",
			},
		},
	}
	router.Get("/plugins", router.getPlugins)

	req, _ := http.NewRequest(http.MethodGet, "/plugins", nil)
	w := httptest.NewRecorder()

	router.getPlugins(w, req)

	require.Equal(t, http.StatusOK, w.Code)
	require.Equal(t, "[{\"name\":\"applications\",\"displayName\":\"Applications\",\"description\":\"Monitor your Kubernetes workloads.\",\"home\":true,\"type\":\"applications\",\"options\":null},{\"name\":\"resources\",\"displayName\":\"Resources\",\"description\":\"View and edit Kubernetes resources.\",\"home\":false,\"type\":\"resources\",\"options\":null}]\n", string(w.Body.Bytes()))
}

func TestRegister(t *testing.T) {
	router := Register(nil, Config{})
	require.NotEmpty(t, router)
}
