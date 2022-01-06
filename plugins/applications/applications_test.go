package applications

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	applicationv1 "github.com/kobsio/kobs/pkg/api/apis/application/v1"
	teamv1 "github.com/kobsio/kobs/pkg/api/apis/team/v1"
	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/clusters/cluster"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/plugins/applications/pkg/tags"
	"github.com/kobsio/kobs/plugins/applications/pkg/teams"
	"github.com/kobsio/kobs/plugins/applications/pkg/topology"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetApplications(t *testing.T) {
	for _, tt := range []struct {
		name               string
		teamsCache         teams.Cache
		topologyCache      topology.Cache
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockClusterClient *cluster.MockClient)
	}{
		{
			name:               "invalid view property",
			url:                "/applications",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Invalid view property\"}\n",
			prepare:            func(mockClusterClient *cluster.MockClient) {},
		},
		// gallery - team
		// The following tests are used for the gallery view, when the user requests the applications for a specific
		// team via the teamCluster, teamNamespace and teamName parameters.
		{
			name:               "gallery return teams from cache",
			teamsCache:         teams.Cache{LastFetch: time.Now().Add(-10 * time.Second), CacheDuration: 60 * time.Second},
			url:                "/applications?view=gallery&teamCluster=cluster1&teamNamespace=namespace1&teamName=team1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetTeams", mock.Anything, "").Return([]teamv1.TeamSpec{{Cluster: "cluster1", Namespace: "namespace1", Name: "team1"}}, nil)
				mockClusterClient.On("GetApplications", mock.Anything, "").Return([]applicationv1.ApplicationSpec{{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Teams: []applicationv1.TeamReference{{Cluster: "cluster1", Namespace: "namespace1", Name: "team1"}}}}, nil)
			},
		},
		{
			name:               "gallery return teams with cached teams nil",
			url:                "/applications?view=gallery&teamCluster=cluster1&teamNamespace=namespace1&teamName=team1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"application1\",\"teams\":[{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"team1\"}],\"topology\":{}}]\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetTeams", mock.Anything, "").Return([]teamv1.TeamSpec{{Cluster: "cluster1", Namespace: "namespace1", Name: "team1"}}, nil)
				mockClusterClient.On("GetApplications", mock.Anything, "").Return([]applicationv1.ApplicationSpec{{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Teams: []applicationv1.TeamReference{{Cluster: "cluster1", Namespace: "namespace1", Name: "team1"}}}}, nil)
			},
		},
		{
			name:               "gallery return teams with cached teams nil and get teams nil",
			url:                "/applications?view=gallery&teamCluster=cluster1&teamNamespace=namespace1&teamName=team1",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get applications\"}\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetTeams", mock.Anything, "").Return(nil, nil)
				mockClusterClient.On("GetApplications", mock.Anything, "").Return([]applicationv1.ApplicationSpec{{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Teams: []applicationv1.TeamReference{{Cluster: "cluster1", Namespace: "namespace1", Name: "team1"}}}}, nil)
			},
		},
		{
			name:               "gallery return teams from cache and refresh cache",
			teamsCache:         teams.Cache{Teams: []teams.Team{{Cluster: "cluster1", Namespace: "namespace1", Name: "team1", Applications: []applicationv1.ApplicationSpec{{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Teams: []applicationv1.TeamReference{{Cluster: "cluster1", Namespace: "namespace1", Name: "team1"}}}}}}},
			url:                "/applications?view=gallery&teamCluster=cluster1&teamNamespace=namespace1&teamName=team1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"application1\",\"teams\":[{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"team1\"}],\"topology\":{}}]\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetTeams", mock.Anything, "").Return([]teamv1.TeamSpec{{Cluster: "cluster1", Namespace: "namespace1", Name: "team1"}}, nil)
				mockClusterClient.On("GetApplications", mock.Anything, "").Return([]applicationv1.ApplicationSpec{{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Teams: []applicationv1.TeamReference{{Cluster: "cluster1", Namespace: "namespace1", Name: "team1"}}}}, nil)
			},
		},
		// gallery
		// The following tests are used for the gallery view, when the user requests the applications via the cluster,
		// namespace and tag parameters.
		{
			name:               "gallery invalid cluster name",
			url:                "/applications?view=gallery&cluster=cluster2",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Invalid cluster name\"}\n",
			prepare:            func(mockClusterClient *cluster.MockClient) {},
		},
		{
			name:               "gallery namespaces nil and get applications error",
			url:                "/applications?view=gallery&cluster=cluster1",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get applications: could not get applications\"}\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetApplications", mock.Anything, "").Return(nil, fmt.Errorf("could not get applications"))
			},
		},
		{
			name:               "gallery namespaces nil",
			url:                "/applications?view=gallery&cluster=cluster1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"application1\",\"teams\":[{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"team1\"}],\"topology\":{}}]\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetApplications", mock.Anything, "").Return([]applicationv1.ApplicationSpec{{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Teams: []applicationv1.TeamReference{{Cluster: "cluster1", Namespace: "namespace1", Name: "team1"}}}}, nil)
			},
		},
		{
			name:               "gallery get applications error",
			url:                "/applications?view=gallery&cluster=cluster1&namespace=namespace1",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get applications: could not get applications\"}\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetApplications", mock.Anything, "namespace1").Return(nil, fmt.Errorf("could not get applications"))
			},
		},
		{
			name:               "gallery",
			url:                "/applications?view=gallery&cluster=cluster1&namespace=namespace1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"application1\",\"teams\":[{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"team1\"}],\"topology\":{}}]\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetApplications", mock.Anything, "namespace1").Return([]applicationv1.ApplicationSpec{{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Teams: []applicationv1.TeamReference{{Cluster: "cluster1", Namespace: "namespace1", Name: "team1"}}}}, nil)
			},
		},
		// topology
		// The following tests are used when the user requests applications via the view=topology parameter.
		{
			name:               "topology return applications from cache",
			topologyCache:      topology.Cache{LastFetch: time.Now().Add(-10 * time.Second), CacheDuration: 60 * time.Second},
			url:                "/applications?view=topology",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"edges\":null,\"nodes\":null}\n",
			prepare:            func(mockClusterClient *cluster.MockClient) {},
		},
		{
			name:               "topology return applications nodes are nil",
			topologyCache:      topology.Cache{Topology: &topology.Topology{Edges: nil, Nodes: nil}},
			url:                "/applications?view=topology&cluster=cluster1&namespace=namespace2",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"edges\":[{\"data\":{\"id\":\"cluster1-namespace2-application3-cluster2-namespace3-application4\",\"source\":\"cluster1-namespace2-application3\",\"target\":\"cluster2-namespace3-application4\",\"description\":\"\",\"dashboards\":null}},{\"data\":{\"id\":\"cluster1-namespace2-application3-cluster2-namespace3-application5\",\"source\":\"cluster1-namespace2-application3\",\"target\":\"cluster2-namespace3-application5\",\"description\":\"\",\"dashboards\":null}}],\"nodes\":[{\"data\":{\"id\":\"cluster1-namespace2-application3\",\"type\":\"\",\"label\":\"application3\",\"parent\":\"cluster1-namespace2\",\"cluster\":\"cluster1\",\"namespace\":\"namespace2\",\"name\":\"application3\",\"topology\":{\"dependencies\":[{\"cluster\":\"cluster2\",\"namespace\":\"namespace3\",\"name\":\"application4\"},{\"cluster\":\"cluster2\",\"namespace\":\"namespace3\",\"name\":\"application5\"}]}}},{\"data\":{\"id\":\"cluster2-namespace3-application4\",\"type\":\"-not-selected\",\"label\":\"application4\",\"parent\":\"cluster2-namespace3\",\"cluster\":\"cluster2\",\"namespace\":\"namespace3\",\"name\":\"application4\",\"topology\":{}}},{\"data\":{\"id\":\"cluster2-namespace3-application5\",\"type\":\"-not-selected\",\"label\":\"application5\",\"parent\":\"cluster2-namespace3\",\"cluster\":\"cluster2\",\"namespace\":\"namespace3\",\"name\":\"application5\",\"topology\":{}}},{\"data\":{\"id\":\"cluster1\",\"type\":\"cluster\",\"label\":\"cluster1\",\"parent\":\"\",\"topology\":{}}},{\"data\":{\"id\":\"cluster2\",\"type\":\"cluster\",\"label\":\"cluster2\",\"parent\":\"\",\"topology\":{}}},{\"data\":{\"id\":\"cluster1-namespace2\",\"type\":\"namespace\",\"label\":\"namespace2\",\"parent\":\"cluster1\",\"topology\":{}}},{\"data\":{\"id\":\"cluster2-namespace3\",\"type\":\"namespace\",\"label\":\"namespace3\",\"parent\":\"cluster2\",\"topology\":{}}},{\"data\":{\"id\":\"cluster1-namespace2\",\"type\":\"namespace\",\"label\":\"namespace2\",\"parent\":\"cluster1\",\"topology\":{}}},{\"data\":{\"id\":\"cluster2-namespace3\",\"type\":\"namespace\",\"label\":\"namespace3\",\"parent\":\"cluster2\",\"topology\":{}}}]}\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetApplications", mock.Anything, "").Return([]applicationv1.ApplicationSpec{
					{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Topology: applicationv1.Topology{Dependencies: []applicationv1.Dependency{{Cluster: "", Namespace: "", Name: "application2"}}}},
					{Cluster: "cluster1", Namespace: "namespace1", Name: "application2", Topology: applicationv1.Topology{Dependencies: []applicationv1.Dependency{{Cluster: "", Namespace: "namespace2", Name: "application3"}}}},
					{Cluster: "cluster1", Namespace: "namespace2", Name: "application3", Topology: applicationv1.Topology{Dependencies: []applicationv1.Dependency{{Cluster: "cluster2", Namespace: "namespace3", Name: "application4"}, {Cluster: "cluster2", Namespace: "namespace3", Name: "application5"}}}},
					{Cluster: "cluster2", Namespace: "namespace3", Name: "application4"},
					{Cluster: "cluster2", Namespace: "namespace3", Name: "application5"},
				}, nil)
			},
		},
		{
			name:               "topology return applications nodes are nil and error generating topology",
			topologyCache:      topology.Cache{Topology: &topology.Topology{Edges: nil, Nodes: nil}},
			url:                "/applications?view=topology&cluster=cluster1&namespace=namespace2",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not generate topology\"}\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetApplications", mock.Anything, "").Return(nil, fmt.Errorf("could not get applications"))
			},
		},
		{
			name: "topology return applications from cache and rebuild topology chart",
			topologyCache: topology.Cache{Topology: &topology.Topology{
				Edges: []topology.Edge{
					{Data: topology.EdgeData{ID: "cluster1-namespace1-application1-cluster1-namespace1-application2", Source: "cluster1-namespace1-application1", SourceCluster: "cluster1", SourceNamespace: "namespace1", SourceName: "application1", Target: "cluster1-namespace1-application2", TargetCluster: "cluster1", TargetNamespace: "namespace1", TargetName: "application2"}},
					{Data: topology.EdgeData{ID: "cluster1-namespace1-application2-cluster1-namespace2-application3", Source: "cluster1-namespace1-application2", SourceCluster: "cluster1", SourceNamespace: "namespace1", SourceName: "application2", Target: "cluster1-namespace2-application3", TargetCluster: "cluster1", TargetNamespace: "namespace2", TargetName: "application3"}},
					{Data: topology.EdgeData{ID: "cluster1-namespace2-application3-cluster2-namespace3-application4", Source: "cluster1-namespace2-application3", SourceCluster: "cluster1", SourceNamespace: "namespace2", SourceName: "application3", Target: "cluster2-namespace3-application4", TargetCluster: "cluster2", TargetNamespace: "namespace3", TargetName: "application4"}},
					{Data: topology.EdgeData{ID: "cluster1-namespace2-application3-cluster2-namespace3-application5", Source: "cluster1-namespace2-application3", SourceCluster: "cluster1", SourceNamespace: "namespace2", SourceName: "application3", Target: "cluster2-namespace3-application5", TargetCluster: "cluster2", TargetNamespace: "namespace3", TargetName: "application5"}},
				},
				Nodes: []topology.Node{
					{Data: topology.NodeData{ID: "cluster1-namespace1-application1", Type: "application", Label: "application1", Parent: "cluster1-namespace1", ApplicationSpec: applicationv1.ApplicationSpec{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Topology: applicationv1.Topology{Dependencies: []applicationv1.Dependency{{Cluster: "", Namespace: "", Name: "application2"}}}}}},
					{Data: topology.NodeData{ID: "cluster1-namespace1-application2", Type: "application", Label: "application2", Parent: "cluster1-namespace1", ApplicationSpec: applicationv1.ApplicationSpec{Cluster: "cluster1", Namespace: "namespace1", Name: "application2", Topology: applicationv1.Topology{Dependencies: []applicationv1.Dependency{{Cluster: "", Namespace: "namespace2", Name: "application3"}}}}}},
					{Data: topology.NodeData{ID: "cluster1-namespace2-application3", Type: "application", Label: "application3", Parent: "cluster1-namespace2", ApplicationSpec: applicationv1.ApplicationSpec{Cluster: "cluster1", Namespace: "namespace2", Name: "application3", Topology: applicationv1.Topology{Dependencies: []applicationv1.Dependency{{Cluster: "cluster2", Namespace: "namespace3", Name: "application4"}, {Cluster: "cluster2", Namespace: "namespace3", Name: "application5"}}}}}},
					{Data: topology.NodeData{ID: "cluster2-namespace3-application4", Type: "application", Label: "application4", Parent: "cluster2-namespace3", ApplicationSpec: applicationv1.ApplicationSpec{Cluster: "cluster2", Namespace: "namespace3", Name: "application4"}}},
					{Data: topology.NodeData{ID: "cluster2-namespace3-application5", Type: "application", Label: "application5", Parent: "cluster2-namespace3", ApplicationSpec: applicationv1.ApplicationSpec{Cluster: "cluster2", Namespace: "namespace3", Name: "application5"}}},
				},
			}},
			url:                "/applications?view=topology&cluster=cluster1&namespace=namespace2",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"edges\":[{\"data\":{\"id\":\"cluster1-namespace1-application2-cluster1-namespace2-application3\",\"source\":\"cluster1-namespace1-application2\",\"target\":\"cluster1-namespace2-application3\",\"description\":\"\",\"dashboards\":null}},{\"data\":{\"id\":\"cluster1-namespace2-application3-cluster2-namespace3-application4\",\"source\":\"cluster1-namespace2-application3\",\"target\":\"cluster2-namespace3-application4\",\"description\":\"\",\"dashboards\":null}},{\"data\":{\"id\":\"cluster1-namespace2-application3-cluster2-namespace3-application5\",\"source\":\"cluster1-namespace2-application3\",\"target\":\"cluster2-namespace3-application5\",\"description\":\"\",\"dashboards\":null}}],\"nodes\":[{\"data\":{\"id\":\"cluster1-namespace1-application2\",\"type\":\"application-not-selected\",\"label\":\"application2\",\"parent\":\"cluster1-namespace1\",\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"application2\",\"topology\":{\"dependencies\":[{\"namespace\":\"namespace2\",\"name\":\"application3\"}]}}},{\"data\":{\"id\":\"cluster1-namespace2-application3\",\"type\":\"application\",\"label\":\"application3\",\"parent\":\"cluster1-namespace2\",\"cluster\":\"cluster1\",\"namespace\":\"namespace2\",\"name\":\"application3\",\"topology\":{\"dependencies\":[{\"cluster\":\"cluster2\",\"namespace\":\"namespace3\",\"name\":\"application4\"},{\"cluster\":\"cluster2\",\"namespace\":\"namespace3\",\"name\":\"application5\"}]}}},{\"data\":{\"id\":\"cluster2-namespace3-application4\",\"type\":\"application-not-selected\",\"label\":\"application4\",\"parent\":\"cluster2-namespace3\",\"cluster\":\"cluster2\",\"namespace\":\"namespace3\",\"name\":\"application4\",\"topology\":{}}},{\"data\":{\"id\":\"cluster2-namespace3-application5\",\"type\":\"application-not-selected\",\"label\":\"application5\",\"parent\":\"cluster2-namespace3\",\"cluster\":\"cluster2\",\"namespace\":\"namespace3\",\"name\":\"application5\",\"topology\":{}}},{\"data\":{\"id\":\"cluster1\",\"type\":\"cluster\",\"label\":\"cluster1\",\"parent\":\"\",\"topology\":{}}},{\"data\":{\"id\":\"cluster2\",\"type\":\"cluster\",\"label\":\"cluster2\",\"parent\":\"\",\"topology\":{}}},{\"data\":{\"id\":\"cluster1-namespace1\",\"type\":\"namespace\",\"label\":\"namespace1\",\"parent\":\"cluster1\",\"topology\":{}}},{\"data\":{\"id\":\"cluster1-namespace2\",\"type\":\"namespace\",\"label\":\"namespace2\",\"parent\":\"cluster1\",\"topology\":{}}},{\"data\":{\"id\":\"cluster1-namespace2\",\"type\":\"namespace\",\"label\":\"namespace2\",\"parent\":\"cluster1\",\"topology\":{}}},{\"data\":{\"id\":\"cluster2-namespace3\",\"type\":\"namespace\",\"label\":\"namespace3\",\"parent\":\"cluster2\",\"topology\":{}}},{\"data\":{\"id\":\"cluster1-namespace2\",\"type\":\"namespace\",\"label\":\"namespace2\",\"parent\":\"cluster1\",\"topology\":{}}},{\"data\":{\"id\":\"cluster2-namespace3\",\"type\":\"namespace\",\"label\":\"namespace3\",\"parent\":\"cluster2\",\"topology\":{}}}]}\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetApplications", mock.Anything, "").Return([]applicationv1.ApplicationSpec{
					{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Topology: applicationv1.Topology{Dependencies: []applicationv1.Dependency{{Cluster: "", Namespace: "", Name: "application2"}}}},
					{Cluster: "cluster1", Namespace: "namespace1", Name: "application2", Topology: applicationv1.Topology{Dependencies: []applicationv1.Dependency{{Cluster: "", Namespace: "namespace2", Name: "application3"}}}},
					{Cluster: "cluster1", Namespace: "namespace2", Name: "application3", Topology: applicationv1.Topology{Dependencies: []applicationv1.Dependency{{Cluster: "cluster2", Namespace: "namespace3", Name: "application4"}, {Cluster: "cluster2", Namespace: "namespace3", Name: "application5"}}}},
					{Cluster: "cluster2", Namespace: "namespace3", Name: "application4"},
					{Cluster: "cluster2", Namespace: "namespace3", Name: "application5"},
				}, nil)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetClusters").Return([]cluster.Client{mockClusterClient})
			mockClustersClient.On("GetCluster", "cluster1").Return(mockClusterClient)
			mockClustersClient.On("GetCluster", "cluster2").Return(nil)

			tt.prepare(mockClusterClient)

			router := Router{chi.NewRouter(), mockClustersClient, Config{}, tt.topologyCache, tt.teamsCache, tags.Cache{}}
			router.Get("/applications", router.getApplications)

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			w := httptest.NewRecorder()

			router.getApplications(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestGetApplication(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name:               "could not get cluster",
			url:                "/application",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Invalid cluster name\"}\n",
		},
		{
			name:               "could not get application",
			url:                "/application?cluster=cluster1",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get application: could not get application\"}\n",
		},
		{
			name:               "return application",
			url:                "/application?cluster=cluster1&namespace=namespace1&name=application1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"name\":\"application1\",\"topology\":{}}\n",
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)
			mockClusterClient.On("GetApplication", mock.Anything, "namespace1", "application1").Return(&applicationv1.ApplicationSpec{Cluster: "cluster1", Namespace: "namespace1", Name: "application1"}, nil)
			mockClusterClient.On("GetApplication", mock.Anything, "", "").Return(nil, fmt.Errorf("could not get application"))

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetCluster", "").Return(nil)
			mockClustersClient.On("GetCluster", "cluster1").Return(mockClusterClient)

			router := Router{chi.NewRouter(), mockClustersClient, Config{}, topology.Cache{}, teams.Cache{}, tags.Cache{}}
			router.Get("/application", router.getApplication)

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			w := httptest.NewRecorder()

			router.getApplication(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestGetTags(t *testing.T) {
	for _, tt := range []struct {
		name               string
		tagsCache          tags.Cache
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockClusterClient *cluster.MockClient)
	}{
		{
			name: "return tags from cache",
			tagsCache: tags.Cache{
				LastFetch:     time.Now().Add(-10 * time.Second),
				CacheDuration: 60 * time.Second,
				Tags:          []string{"tag1", "tag2", "tag3"},
			},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[\"tag1\",\"tag2\",\"tag3\"]\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetApplications", mock.Anything, "").Return(nil, fmt.Errorf("could not get applications"))
			},
		},
		{
			name:               "get applications error",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not get tags: could not get applications\"}\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetApplications", mock.Anything, "").Return(nil, fmt.Errorf("could not get applications"))
			},
		},
		{
			name:               "return tags",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[\"tag1\",\"tag2\",\"tag3\",\"tag4\",\"tag5\"]\n",
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetApplications", mock.Anything, "").Return([]applicationv1.ApplicationSpec{
					{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Tags: []string{"tag1", "tag2", "tag3"}},
					{Cluster: "cluster1", Namespace: "namespace1", Name: "application2", Tags: []string{"tag1", "tag4", "tag5"}},
					{Cluster: "cluster1", Namespace: "namespace1", Name: "application3", Tags: []string{"tag2"}},
					{Cluster: "cluster1", Namespace: "namespace1", Name: "application4", Tags: []string{"tag2", "tag3"}},
					{Cluster: "cluster1", Namespace: "namespace1", Name: "application5", Tags: []string{"tag3", "tag4", "tag5"}},
				}, nil)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetClusters").Return([]cluster.Client{mockClusterClient})

			tt.prepare(mockClusterClient)

			router := Router{chi.NewRouter(), mockClustersClient, Config{}, topology.Cache{}, teams.Cache{}, tt.tagsCache}
			router.Get("/tags", router.getTags)

			req, _ := http.NewRequest(http.MethodGet, "/tags", nil)
			w := httptest.NewRecorder()

			router.getTags(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestRegister(t *testing.T) {
	expectedPlugins := &plugin.Plugins{
		plugin.Plugin{
			Name:        "applications",
			DisplayName: "Applications",
			Description: "Monitor your Kubernetes workloads.",
			Home:        true,
			Type:        "applications",
			Options: map[string]interface{}{
				"topology": []topology.Config(nil),
			},
		},
	}

	t.Run("config without durations", func(t *testing.T) {
		plugins := &plugin.Plugins{}
		router := Register(nil, plugins, Config{})
		require.NotEmpty(t, router)
		require.Equal(t, expectedPlugins, plugins)
	})

	t.Run("config with durations", func(t *testing.T) {
		plugins := &plugin.Plugins{}
		router := Register(nil, plugins, Config{Cache: CacheConfig{TopologyDuration: "1m", TeamsDuration: "1m", TagsDuration: "1m"}})
		require.NotEmpty(t, router)
		require.Equal(t, expectedPlugins, plugins)
	})
}
