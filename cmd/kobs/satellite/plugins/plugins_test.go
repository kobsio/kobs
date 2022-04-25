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
				Name: "dev-de1",
				Type: "prometheus",
			},
			{
				Name:    "dev-de1",
				Type:    "klogs",
				Options: map[string]interface{}{"test": "test"},
			},
		},
	}
	router.Get("/plugins", router.getPlugins)

	req, _ := http.NewRequest(http.MethodGet, "/plugins", nil)
	w := httptest.NewRecorder()

	router.getPlugins(w, req)

	require.Equal(t, http.StatusOK, w.Code)
	require.Equal(t, "[{\"name\":\"dev-de1\",\"type\":\"prometheus\",\"options\":null},{\"name\":\"dev-de1\",\"type\":\"klogs\",\"options\":{\"test\":\"test\"}}]\n", string(w.Body.Bytes()))
}

func TestRegister(t *testing.T) {
	router := Register(nil, Config{})
	require.NotEmpty(t, router)
}
