package instance

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kiali/kiali/models"
	"github.com/stretchr/testify/require"
)

func TestGetName(t *testing.T) {
	instance := &instance{
		name: "kiali",
	}

	require.Equal(t, "kiali", instance.GetName())
}

func TestGetNamespaces(t *testing.T) {
	t.Run("should return request error", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/kiali/api/namespaces" {
				w.WriteHeader(http.StatusBadRequest)
			}
		}))
		defer ts.Close()

		instance := &instance{
			name:    "kiali",
			address: ts.URL,
			client:  ts.Client(),
		}

		_, err := instance.GetNamespaces(context.Background())
		require.Error(t, err)
	})

	t.Run("should return error for invalid json", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/kiali/api/namespaces" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(`{"name": "kube-system"}`))
			}
		}))
		defer ts.Close()

		instance := &instance{
			name:    "kiali",
			address: ts.URL,
			client:  ts.Client(),
		}

		_, err := instance.GetNamespaces(context.Background())
		require.Error(t, err)
	})

	t.Run("should return namespaces", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/kiali/api/namespaces" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(`[{"name": "kube-system"}, {"name": "default"}]`))
			}
		}))
		defer ts.Close()

		instance := &instance{
			name:    "kiali",
			address: ts.URL,
			client:  ts.Client(),
		}

		namespaces, err := instance.GetNamespaces(context.Background())
		require.NoError(t, err)
		require.Equal(t, []models.Namespace{{Name: "kube-system"}, {Name: "default"}}, namespaces)
	})
}

func TestGetGraph(t *testing.T) {
	t.Run("should return request error", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/kiali/api/namespaces/graph" {
				w.WriteHeader(http.StatusBadRequest)
			}
		}))
		defer ts.Close()

		instance := &instance{
			name:    "kiali",
			address: ts.URL,
			client:  ts.Client(),
		}

		_, err := instance.GetGraph(context.Background(), 0, "", "", true, nil, nil)
		require.Error(t, err)
	})

	t.Run("should return error for invalid json", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/kiali/api/namespaces/graph" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(`[]`))
			}
		}))
		defer ts.Close()

		instance := &instance{
			name:    "kiali",
			address: ts.URL,
			client:  ts.Client(),
		}

		_, err := instance.GetGraph(context.Background(), 0, "", "", true, nil, nil)
		require.Error(t, err)
	})

	t.Run("should return graph", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/kiali/api/namespaces/graph" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(`{
					"timestamp": 1680109375,
					"duration": 60,
					"graphType": "versionedApp",
					"elements": {
					  "nodes": [
						{
						  "data": {
							"id": "7e6519e4023bb2a0cbd3dca7cfbb3688",
							"nodeType": "box",
							"cluster": "Kubernetes",
							"namespace": "mynamespace",
							"app": "myapp",
							"healthData": {
							  "workloadStatuses": [
								{
								  "name": "myapp",
								  "desiredReplicas": 3,
								  "currentReplicas": 3,
								  "availableReplicas": 3,
								  "syncedProxies": 3
								}
							  ],
							  "requests": {
								"inbound": {
								  "http": {
									"200": 0.017
								  }
								},
								"outbound": {},
								"healthAnnotations": {}
							  }
							},
							"isBox": "app"
						  }
						},
						{
						  "data": {
							"id": "5aa4b7f4867ef44e0df9ea7bef79e02c",
							"parent": "7e6519e4023bb2a0cbd3dca7cfbb3688",
							"nodeType": "service",
							"cluster": "Kubernetes",
							"namespace": "mynamespace",
							"app": "myapp",
							"service": "myapp",
							"destServices": [
							  {
								"cluster": "Kubernetes",
								"namespace": "mynamespace",
								"name": "myapp"
							  }
							],
							"traffic": [
							  {
								"protocol": "http",
								"rates": {
								  "httpIn": "0.02",
								  "httpOut": "0.02"
								}
							  }
							],
							"healthData": {
							  "requests": {
								"inbound": {
								  "http": {
									"200": 0.017
								  }
								},
								"outbound": {
								  "http": {
									"200": 0.017
								  }
								},
								"healthAnnotations": {}
							  }
							},
							"hasCB": true,
							"hasRequestRouting": true,
							"hasRequestTimeout": true,
							"hasVS": {
							  "hostnames": [
								"myapp.kobs.io"
							  ]
							}
						  }
						},
						{
						  "data": {
							"id": "167cd5e3c07af089abc3f970866e388f",
							"parent": "7e6519e4023bb2a0cbd3dca7cfbb3688",
							"nodeType": "app",
							"cluster": "Kubernetes",
							"namespace": "mynamespace",
							"workload": "myapp",
							"app": "myapp",
							"version": "latest",
							"destServices": [
							  {
								"cluster": "Kubernetes",
								"namespace": "mynamespace",
								"name": "myapp"
							  }
							],
							"traffic": [
							  {
								"protocol": "http",
								"rates": {
								  "httpIn": "0.02"
								}
							  }
							],
							"healthData": {
							  "workloadStatuses": [],
							  "requests": {
								"inbound": {
								  "http": {
									"200": 0.017
								  }
								},
								"outbound": {},
								"healthAnnotations": {}
							  }
							},
							"hasCB": true
						  }
						},
						{
						  "data": {
							"id": "a667b44b1e859fa663a3e5f4255bec01",
							"nodeType": "app",
							"cluster": "Kubernetes",
							"namespace": "istio-system",
							"workload": "istio-ingressgateway",
							"app": "istio-ingressgateway",
							"version": "latest",
							"traffic": [
							  {
								"protocol": "http",
								"rates": {
								  "httpOut": "0.02"
								}
							  }
							],
							"healthData": {
							  "workloadStatuses": [],
							  "requests": {
								"inbound": {},
								"outbound": {
								  "http": {
									"200": 0.017
								  }
								},
								"healthAnnotations": {}
							  }
							},
							"isGateway": {
							  "ingressInfo": {
								"hostnames": [
								  "*.kobs.io"
								]
							  },
							  "egressInfo": {},
							  "gatewayAPIInfo": {}
							},
							"isOutside": true,
							"isRoot": true
						  }
						}
					  ],
					  "edges": [
						{
						  "data": {
							"id": "52f74d1374f86842431e2bba1bb3a72e",
							"source": "5aa4b7f4867ef44e0df9ea7bef79e02c",
							"target": "167cd5e3c07af089abc3f970866e388f",
							"traffic": {
							  "protocol": "http",
							  "rates": {
								"http": "0.02",
								"httpPercentReq": "100.0",
								"httpPercentErr": "0.0"
							  },
							  "responses": {
								"200": {
								  "flags": {
									"-": "100.0"
								  },
								  "hosts": {
									"myapp.myapp.svc.cluster.local": "100.0"
								  }
								}
							  }
							}
						  }
						},
						{
						  "data": {
							"id": "a883d1e85147c9686e41a188d5db2712",
							"source": "a667b44b1e859fa663a3e5f4255bec01",
							"target": "5aa4b7f4867ef44e0df9ea7bef79e02c",
							"traffic": {
							  "protocol": "http",
							  "rates": {
								"http": "0.02",
								"httpPercentReq": "100.0"
							  },
							  "responses": {
								"200": {
								  "flags": {
									"-": "100.0"
								  },
								  "hosts": {
									"myapp.myapp.svc.cluster.local": "100.0"
								  }
								}
							  }
							}
						  }
						}
					  ]
					}
				  }`))
			}
		}))
		defer ts.Close()

		instance := &instance{
			name:    "kiali",
			address: ts.URL,
			client:  ts.Client(),
		}

		graph, err := instance.GetGraph(context.Background(), 0, "", "", true, nil, nil)
		require.NoError(t, err)
		require.Equal(t, 4, len(graph.Elements.Nodes))
		require.Equal(t, 2, len(graph.Elements.Edges))
	})
}

func TestGetApplicationGraph(t *testing.T) {
	t.Run("should return request error", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/kiali/api/namespaces/myservice/applications/myservice/graph" {
				w.WriteHeader(http.StatusBadRequest)
			}
		}))
		defer ts.Close()

		instance := &instance{
			name:    "kiali",
			address: ts.URL,
			client:  ts.Client(),
		}

		_, err := instance.GetApplicationGraph(context.Background(), "myservice", "myservice", 0, "", "", true, nil)
		require.Error(t, err)
	})

	t.Run("should return error for invalid json", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/kiali/api/namespaces/myservice/applications/myservice/graph" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(`[]`))
			}
		}))
		defer ts.Close()

		instance := &instance{
			name:    "kiali",
			address: ts.URL,
			client:  ts.Client(),
		}

		_, err := instance.GetApplicationGraph(context.Background(), "myservice", "myservice", 0, "", "", true, nil)
		require.Error(t, err)
	})

	t.Run("should return graph", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/kiali/api/namespaces/myservice/applications/myservice/graph" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(`{
					"timestamp": 1680109375,
					"duration": 60,
					"graphType": "versionedApp",
					"elements": {
					  "nodes": [
						{
						  "data": {
							"id": "7e6519e4023bb2a0cbd3dca7cfbb3688",
							"nodeType": "box",
							"cluster": "Kubernetes",
							"namespace": "mynamespace",
							"app": "myapp",
							"healthData": {
							  "workloadStatuses": [
								{
								  "name": "myapp",
								  "desiredReplicas": 3,
								  "currentReplicas": 3,
								  "availableReplicas": 3,
								  "syncedProxies": 3
								}
							  ],
							  "requests": {
								"inbound": {
								  "http": {
									"200": 0.017
								  }
								},
								"outbound": {},
								"healthAnnotations": {}
							  }
							},
							"isBox": "app"
						  }
						},
						{
						  "data": {
							"id": "5aa4b7f4867ef44e0df9ea7bef79e02c",
							"parent": "7e6519e4023bb2a0cbd3dca7cfbb3688",
							"nodeType": "service",
							"cluster": "Kubernetes",
							"namespace": "mynamespace",
							"app": "myapp",
							"service": "myapp",
							"destServices": [
							  {
								"cluster": "Kubernetes",
								"namespace": "mynamespace",
								"name": "myapp"
							  }
							],
							"traffic": [
							  {
								"protocol": "http",
								"rates": {
								  "httpIn": "0.02",
								  "httpOut": "0.02"
								}
							  }
							],
							"healthData": {
							  "requests": {
								"inbound": {
								  "http": {
									"200": 0.017
								  }
								},
								"outbound": {
								  "http": {
									"200": 0.017
								  }
								},
								"healthAnnotations": {}
							  }
							},
							"hasCB": true,
							"hasRequestRouting": true,
							"hasRequestTimeout": true,
							"hasVS": {
							  "hostnames": [
								"myapp.kobs.io"
							  ]
							}
						  }
						},
						{
						  "data": {
							"id": "167cd5e3c07af089abc3f970866e388f",
							"parent": "7e6519e4023bb2a0cbd3dca7cfbb3688",
							"nodeType": "app",
							"cluster": "Kubernetes",
							"namespace": "mynamespace",
							"workload": "myapp",
							"app": "myapp",
							"version": "latest",
							"destServices": [
							  {
								"cluster": "Kubernetes",
								"namespace": "mynamespace",
								"name": "myapp"
							  }
							],
							"traffic": [
							  {
								"protocol": "http",
								"rates": {
								  "httpIn": "0.02"
								}
							  }
							],
							"healthData": {
							  "workloadStatuses": [],
							  "requests": {
								"inbound": {
								  "http": {
									"200": 0.017
								  }
								},
								"outbound": {},
								"healthAnnotations": {}
							  }
							},
							"hasCB": true
						  }
						},
						{
						  "data": {
							"id": "a667b44b1e859fa663a3e5f4255bec01",
							"nodeType": "app",
							"cluster": "Kubernetes",
							"namespace": "istio-system",
							"workload": "istio-ingressgateway",
							"app": "istio-ingressgateway",
							"version": "latest",
							"traffic": [
							  {
								"protocol": "http",
								"rates": {
								  "httpOut": "0.02"
								}
							  }
							],
							"healthData": {
							  "workloadStatuses": [],
							  "requests": {
								"inbound": {},
								"outbound": {
								  "http": {
									"200": 0.017
								  }
								},
								"healthAnnotations": {}
							  }
							},
							"isGateway": {
							  "ingressInfo": {
								"hostnames": [
								  "*.kobs.io"
								]
							  },
							  "egressInfo": {},
							  "gatewayAPIInfo": {}
							},
							"isOutside": true,
							"isRoot": true
						  }
						}
					  ],
					  "edges": [
						{
						  "data": {
							"id": "52f74d1374f86842431e2bba1bb3a72e",
							"source": "5aa4b7f4867ef44e0df9ea7bef79e02c",
							"target": "167cd5e3c07af089abc3f970866e388f",
							"traffic": {
							  "protocol": "http",
							  "rates": {
								"http": "0.02",
								"httpPercentReq": "100.0",
								"httpPercentErr": "0.0"
							  },
							  "responses": {
								"200": {
								  "flags": {
									"-": "100.0"
								  },
								  "hosts": {
									"myapp.myapp.svc.cluster.local": "100.0"
								  }
								}
							  }
							}
						  }
						},
						{
						  "data": {
							"id": "a883d1e85147c9686e41a188d5db2712",
							"source": "a667b44b1e859fa663a3e5f4255bec01",
							"target": "5aa4b7f4867ef44e0df9ea7bef79e02c",
							"traffic": {
							  "protocol": "http",
							  "rates": {
								"http": "0.02",
								"httpPercentReq": "100.0"
							  },
							  "responses": {
								"200": {
								  "flags": {
									"-": "100.0"
								  },
								  "hosts": {
									"myapp.myapp.svc.cluster.local": "100.0"
								  }
								}
							  }
							}
						  }
						}
					  ]
					}
				  }`))
			}
		}))
		defer ts.Close()

		instance := &instance{
			name:    "kiali",
			address: ts.URL,
			client:  ts.Client(),
		}

		graph, err := instance.GetApplicationGraph(context.Background(), "myservice", "myservice", 0, "", "", true, nil)
		require.NoError(t, err)
		require.Equal(t, 4, len(graph.Elements.Nodes))
		require.Equal(t, 2, len(graph.Elements.Edges))
	})
}

func TestGetMetrics(t *testing.T) {
	t.Run("should return request error", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/kiali/api/metrics" {
				w.WriteHeader(http.StatusBadRequest)
			}
		}))
		defer ts.Close()

		instance := &instance{
			name:    "kiali",
			address: ts.URL,
			client:  ts.Client(),
		}

		_, err := instance.GetMetrics(context.Background(), "/kiali/api/metrics")
		require.Error(t, err)
	})

	t.Run("should return error for invalid json", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/kiali/api/metrics" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(`[]`))
			}
		}))
		defer ts.Close()

		instance := &instance{
			name:    "kiali",
			address: ts.URL,
			client:  ts.Client(),
		}

		_, err := instance.GetMetrics(context.Background(), "/kiali/api/metrics")
		require.Error(t, err)
	})

	t.Run("should return metrics", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/kiali/api/metrics" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(`{"data": []}`))
			}
		}))
		defer ts.Close()

		instance := &instance{
			name:    "kiali",
			address: ts.URL,
			client:  ts.Client(),
		}

		metrics, err := instance.GetMetrics(context.Background(), "/kiali/api/metrics")
		require.NoError(t, err)
		require.Equal(t, &map[string]any{"data": []any{}}, metrics)
	})
}

func TestNew(t *testing.T) {
	t.Run("should return error for invalid options", func(t *testing.T) {
		instance, err := New("kiali", map[string]any{"address": []string{"localhost"}})
		require.Error(t, err)
		require.Nil(t, instance)
	})

	t.Run("should return instance with default round tripper", func(t *testing.T) {
		instance, err := New("kiali", map[string]any{"address": "localhost"})
		require.NoError(t, err)
		require.NotNil(t, instance)
	})

	t.Run("should return instance with basic auth", func(t *testing.T) {
		instance, err := New("kiali", map[string]any{"address": "localhost", "username": "admin", "password": "admin"})
		require.NoError(t, err)
		require.NotNil(t, instance)
	})

	t.Run("should return instance with token auth", func(t *testing.T) {
		instance, err := New("kiali", map[string]any{"address": "localhost", "token": "token"})
		require.NoError(t, err)
		require.NotNil(t, instance)
	})
}
