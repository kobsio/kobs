package plugins

import (
	"github.com/kobsio/kobs/plugins/backstage"
	"github.com/kobsio/kobs/plugins/prometheus"
	"github.com/kobsio/kobs/plugins/prometheus/pkg/instance"
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
				Name:        "prometheus",
				DisplayName: "Prometheus",
				Description: "From metrics to insight: Power your metrics and alerting with a leading open-source monitoring solution.",
				Home:        true,
				Type:        "prometheus",
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
	require.Equal(t, "[{\"name\":\"applications\",\"displayName\":\"Applications\",\"description\":\"Monitor your Kubernetes workloads.\",\"home\":true,\"type\":\"applications\",\"options\":null},{\"name\":\"prometheus\",\"displayName\":\"Prometheus\",\"description\":\"From metrics to insight: Power your metrics and alerting with a leading open-source monitoring solution.\",\"home\":true,\"type\":\"prometheus\",\"options\":null},{\"name\":\"resources\",\"displayName\":\"Resources\",\"description\":\"View and edit Kubernetes resources.\",\"home\":false,\"type\":\"resources\",\"options\":null}]\n", string(w.Body.Bytes()))
}

func TestRegister(t *testing.T) {
	cfg := Config{
		Backstage: backstage.Config{
			PrometheusName: "prometheus",
		},
		Prometheus: prometheus.Config{instance.Config{
			Name:        "prometheus",
			DisplayName: "Prometheus",
			Description: "From metrics to insight: Power your metrics and alerting with a leading open-source monitoring solution.",
		}},
	}
	router := Register(nil, cfg)
	require.NotEmpty(t, router)
}
