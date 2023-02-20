package resources

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
	"go.opentelemetry.io/otel"
)

func TestGetResources(t *testing.T) {
	defaultTracer := otel.Tracer("fakeTracer")

	var newKubernetesClient = func(t *testing.T) *kubernetes.MockClient {
		ctrl := gomock.NewController(t)
		kubernetesClient := kubernetes.NewMockClient(ctrl)
		return kubernetesClient
	}

	t.Run("should list resources", func(t *testing.T) {
		namespace := "garden"
		name := "apple"
		resource := "fruit"

		resources := map[string]struct {
			Age int `json:"age"`
		}{
			"fruit": {
				Age: 1,
			},
		}
		resourceBytes, err := json.Marshal(resources)
		require.NoError(t, err)

		cluster := "cluster1"
		kubernetesClient := newKubernetesClient(t)
		kubernetesClient.EXPECT().GetResources(gomock.Any(), namespace, name, "", resource, "", "").Return(resourceBytes, nil)

		router := Router{chi.NewRouter(), kubernetesClient, defaultTracer}
		router.Get("/resources", router.getResources)

		requestURI := fmt.Sprintf("/resources?cluster=%s&namespace=%s&name=%s&resource=%s", cluster, namespace, name, resource)
		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, requestURI, nil)
		w := httptest.NewRecorder()

		router.getResources(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, string(resourceBytes))
	})

	t.Run("should handle error from Kubernetes client", func(t *testing.T) {
		kubernetesClient := newKubernetesClient(t)
		kubernetesClient.EXPECT().GetResources(gomock.Any(), "", "", "", "", "", "").Return(nil, fmt.Errorf("unexpected error"))

		router := Router{chi.NewRouter(), kubernetesClient, defaultTracer}
		router.Get("/resources", router.getResources)

		requestURI := fmt.Sprintf("/resources?cluster=%s&namespace=%s&name=%s&resource=%s", "", "", "", "")
		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, requestURI, nil)
		w := httptest.NewRecorder()

		router.getResources(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors":["Failed to get resources"]}`)
	})

	t.Run("should handle unmarshal error", func(t *testing.T) {
		kubernetesClient := newKubernetesClient(t)
		kubernetesClient.EXPECT().GetResources(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return([]byte(`{"bad":"json}`), nil)

		router := Router{chi.NewRouter(), kubernetesClient, defaultTracer}
		router.Get("/resources", router.getResources)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/resources", nil)
		w := httptest.NewRecorder()

		router.getResources(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to unmarshal resources"]}`)
	})
}

type badReader struct{}

func (badReader) Read(p []byte) (n int, err error) {
	return 0, errors.New("read failed from badReader{}")
}

func TestPatchResource(t *testing.T) {
	defaultTracer := otel.Tracer("fakeTracer")

	var newKubernetesClient = func(t *testing.T) *kubernetes.MockClient {
		ctrl := gomock.NewController(t)
		kubernetesClient := kubernetes.NewMockClient(ctrl)
		return kubernetesClient
	}

	t.Run("should patch resource", func(t *testing.T) {
		namespace := "garden"
		name := "apple"
		resource := "fruit"
		path := "path"
		patch := struct {
			Op    string `json:"op"`
			Path  string `json:"path"`
			Value any    `json:"value"`
		}{
			Op:    "replace",
			Path:  "/spec/replicas",
			Value: 3,
		}

		patchJSON, err := json.Marshal(patch)
		require.NoError(t, err)

		kubernetesClient := newKubernetesClient(t)
		kubernetesClient.EXPECT().PatchResource(gomock.Any(), namespace, name, path, resource, patchJSON).Return(nil)

		router := Router{chi.NewRouter(), kubernetesClient, defaultTracer}
		router.Get("/resources", router.patchResource)

		requestURI := fmt.Sprintf("/resources?namespace=%s&name=%s&path=%s&resource=%s", namespace, name, path, resource)
		req, _ := http.NewRequestWithContext(context.Background(), http.MethodDelete, requestURI, strings.NewReader(string(patchJSON)))
		w := httptest.NewRecorder()

		router.patchResource(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})

	t.Run("should handle invalid body", func(t *testing.T) {
		kubernetesClient := newKubernetesClient(t)
		router := Router{chi.NewRouter(), kubernetesClient, defaultTracer}
		router.Get("/resources", router.patchResource)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodDelete, "/resources", badReader{})
		w := httptest.NewRecorder()

		router.patchResource(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors":["Failed to decode request body"]}`)
	})

	t.Run("should handle Kubernetes client error", func(t *testing.T) {
		kubernetesClient := newKubernetesClient(t)
		kubernetesClient.EXPECT().PatchResource(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(fmt.Errorf("unexpected error"))
		router := Router{chi.NewRouter(), kubernetesClient, defaultTracer}
		router.Get("/resources", router.patchResource)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodDelete, "/resources", strings.NewReader(""))
		w := httptest.NewRecorder()

		router.patchResource(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors":["Failed to patch resources"]}`)
	})
}

func TestDeleteResource(t *testing.T) {
	defaultTracer := otel.Tracer("fakeTracer")

	var newKubernetesClient = func(t *testing.T) *kubernetes.MockClient {
		ctrl := gomock.NewController(t)
		kubernetesClient := kubernetes.NewMockClient(ctrl)
		return kubernetesClient
	}

	t.Run("should delete resource", func(t *testing.T) {
		namespace := "garden"
		name := "apple"
		resource := "fruit"
		path := "path"
		force := "false"

		kubernetesClient := newKubernetesClient(t)
		kubernetesClient.EXPECT().DeleteResource(gomock.Any(), namespace, name, path, resource, nil).Return(nil)

		router := Router{chi.NewRouter(), kubernetesClient, defaultTracer}
		router.Get("/resources", router.deleteResource)

		requestURI := fmt.Sprintf("/resources?namespace=%s&name=%s&path=%s&resource=%s&force=%s", namespace, name, path, resource, force)
		req, _ := http.NewRequestWithContext(context.Background(), http.MethodDelete, requestURI, nil)
		w := httptest.NewRecorder()

		router.deleteResource(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})

	t.Run("should force delete resource", func(t *testing.T) {
		namespace := "garden"
		name := "apple"
		resource := "fruit"
		path := "path"
		force := "true"

		kubernetesClient := newKubernetesClient(t)
		kubernetesClient.EXPECT().DeleteResource(gomock.Any(), namespace, name, path, resource, []byte(`{"gracePeriodSeconds": 0}`)).Return(nil)

		router := Router{chi.NewRouter(), kubernetesClient, defaultTracer}
		router.Get("/resources", router.deleteResource)

		requestURI := fmt.Sprintf("/resources?namespace=%s&name=%s&path=%s&resource=%s&force=%s", namespace, name, path, resource, force)
		req, _ := http.NewRequestWithContext(context.Background(), http.MethodDelete, requestURI, nil)
		w := httptest.NewRecorder()

		router.deleteResource(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})

	t.Run("should handle invalid force parameter", func(t *testing.T) {
		kubernetesClient := newKubernetesClient(t)
		router := Router{chi.NewRouter(), kubernetesClient, defaultTracer}
		router.Get("/resources", router.deleteResource)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodDelete, "/resources?force=1234", nil)
		w := httptest.NewRecorder()

		router.deleteResource(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors":["Failed to parse 'force' parameter"]}`)
	})

	t.Run("should handle Kubernetes client error", func(t *testing.T) {
		kubernetesClient := newKubernetesClient(t)
		kubernetesClient.EXPECT().DeleteResource(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(fmt.Errorf("unexpected error"))
		router := Router{chi.NewRouter(), kubernetesClient, defaultTracer}
		router.Get("/resources", router.deleteResource)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodDelete, "/resources?force=true", nil)
		w := httptest.NewRecorder()

		router.deleteResource(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors":["Failed to delete resource"]}`)
	})
}

func TestCreateResource(t *testing.T) {
	defaultTracer := otel.Tracer("fakeTracer")

	var newKubernetesClient = func(t *testing.T) *kubernetes.MockClient {
		ctrl := gomock.NewController(t)
		kubernetesClient := kubernetes.NewMockClient(ctrl)
		return kubernetesClient
	}

	t.Run("should create resource", func(t *testing.T) {
		namespace := "garden"
		name := "apple"
		resource := "fruit"
		subResource := "subfruit"
		path := "path"
		create := `
			{
				"kind": "Pod",
				"apiVersion": "v1",
				"metadata": {
					"name": "pod",
					"labels": {
						"run": "pod"
					}
				},
				"spec": {
					"containers": [
						{
							"name": "pod",
							"image": "nginx:alpine",
						}
					],
				},
				"status": {}
			}`

		kubernetesClient := newKubernetesClient(t)
		kubernetesClient.EXPECT().CreateResource(gomock.Any(), namespace, name, path, resource, subResource, []byte(create)).Return(nil)

		router := Router{chi.NewRouter(), kubernetesClient, defaultTracer}
		router.Get("/resources", router.createResource)

		requestURI := fmt.Sprintf("/resources?namespace=%s&name=%s&path=%s&resource=%s&subResource=%s", namespace, name, path, resource, subResource)
		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, requestURI, strings.NewReader(create))
		w := httptest.NewRecorder()

		router.createResource(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})

	t.Run("should handle bad body", func(t *testing.T) {
		kubernetesClient := newKubernetesClient(t)
		router := Router{chi.NewRouter(), kubernetesClient, defaultTracer}
		router.Get("/resources", router.createResource)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/resources", badReader{})
		w := httptest.NewRecorder()

		router.createResource(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors":["Failed to decode request body"]}`)
	})

	t.Run("should handle Kubernetes client error", func(t *testing.T) {
		kubernetesClient := newKubernetesClient(t)
		kubernetesClient.EXPECT().CreateResource(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(fmt.Errorf("unexpected error"))
		router := Router{chi.NewRouter(), kubernetesClient, defaultTracer}
		router.Get("/resources", router.createResource)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/resources", strings.NewReader(""))
		w := httptest.NewRecorder()

		router.createResource(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors":["Failed to create resource"]}`)
	})
}

func TestGetFile(t *testing.T) {
	defaultTracer := otel.Tracer("fakeTracer")

	var newKubernetesClient = func(t *testing.T) *kubernetes.MockClient {
		ctrl := gomock.NewController(t)
		kubernetesClient := kubernetes.NewMockClient(ctrl)
		return kubernetesClient
	}

	t.Run("should get file", func(t *testing.T) {
		namespace := "garden"
		name := "apple"
		container := "busybox"
		srcPath := "/etc/passwd"
		w := httptest.NewRecorder()

		kubernetesClient := newKubernetesClient(t)
		kubernetesClient.EXPECT().CopyFileFromPod(gomock.Any(), w, namespace, name, container, srcPath).Return(nil)

		router := Router{chi.NewRouter(), kubernetesClient, defaultTracer}
		router.Get("/file", router.getFile)

		requestURI := fmt.Sprintf("/file?namespace=%s&name=%s&container=%s&srcPath=%s", namespace, name, container, srcPath)
		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, requestURI, nil)

		router.getFile(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
	})

	t.Run("should handle Kuberntes client error", func(t *testing.T) {
		kubernetesClient := newKubernetesClient(t)
		kubernetesClient.EXPECT().CopyFileFromPod(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(fmt.Errorf("unexpected error"))

		router := Router{chi.NewRouter(), kubernetesClient, defaultTracer}
		router.Get("/file", router.getFile)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/file", nil)
		w := httptest.NewRecorder()

		router.getFile(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors":["Failed to get file"]}`)
	})
}

func TestGetLogs(t *testing.T) {
	defaultTracer := otel.Tracer("fakeTracer")

	var newKubernetesClient = func(t *testing.T) *kubernetes.MockClient {
		ctrl := gomock.NewController(t)
		kubernetesClient := kubernetes.NewMockClient(ctrl)
		return kubernetesClient
	}

	t.Run("should get logs", func(t *testing.T) {
		namespace := "garden"
		name := "apple"
		container := "busybox"
		regex := ".*"
		since := int64(1234)
		tail := int64(20)
		previous := "false"
		follow := "false"

		kubernetesClient := newKubernetesClient(t)
		kubernetesClient.EXPECT().GetLogs(gomock.Any(), namespace, name, container, regex, since, tail, false).Return("log line", nil)

		router := Router{chi.NewRouter(), kubernetesClient, defaultTracer}
		router.Get("/logs", router.getLogs)

		path := fmt.Sprintf("/logs?namespace=%s&name=%s&container=%s&regex=%s&since=%d&tail=%d&previous=%s&follow=%s", namespace, name, container, regex, since, tail, previous, follow)
		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, path, nil)
		w := httptest.NewRecorder()

		router.getLogs(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"logs":"log line"}`)
	})

	t.Run("should handle bad request query parameters", func(t *testing.T) {
		for _, tt := range []struct {
			name     string
			since    string
			tail     string
			previous string
			follow   string
			err      string
		}{
			{
				name:     "invalid since",
				since:    "abc",
				tail:     "20",
				previous: "false",
				follow:   "true",
				err:      "Failed to parse 'since' parameter",
			},
			{
				name:     "invalid tail",
				since:    "1234",
				tail:     "0.5",
				previous: "false",
				follow:   "true",
				err:      "Failed to parse 'tail' parameter",
			},
			{
				name:     "invalid previous",
				since:    "1234",
				tail:     "20",
				previous: "falsee",
				follow:   "true",
				err:      "Failed to parse 'previous' parameter",
			},
			{
				name:     "invalid follow",
				since:    "1234",
				tail:     "20",
				previous: "false",
				follow:   "truee",
				err:      "Failed to parse 'follow' parameter",
			},
		} {
			t.Run(tt.name, func(t *testing.T) {
				kubernetesClient := newKubernetesClient(t)

				router := Router{chi.NewRouter(), kubernetesClient, defaultTracer}
				router.Get("/logs", router.getLogs)

				path := fmt.Sprintf("/logs?namespace=%s&name=%s&container=%s&regex=%s&since=%s&tail=%s&previous=%s&follow=%s", "namespace", "name", "container", "regex", tt.since, tt.tail, tt.previous, tt.follow)
				req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, path, nil)
				w := httptest.NewRecorder()

				router.getLogs(w, req)

				utils.AssertStatusEq(t, w, http.StatusBadRequest)
				utils.AssertJSONEq(t, w, `{"errors":["`+tt.err+`"]}`)
			})
		}
	})
}

func TestMount(t *testing.T) {
	router := Mount(nil)
	require.NotNil(t, router)
}
