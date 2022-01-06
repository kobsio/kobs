package auth

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	teamv1 "github.com/kobsio/kobs/pkg/api/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/api/apis/user/v1"
	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/clusters/cluster"
	authContext "github.com/kobsio/kobs/pkg/api/middleware/auth/context"
	"github.com/kobsio/kobs/pkg/api/middleware/auth/jwt"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestContainsTeam(t *testing.T) {
	t.Run("teams contain team", func(t *testing.T) {
		require.Equal(t, containsTeam("team1", []string{"team1", "team2"}), true)
	})

	t.Run("teams contain team", func(t *testing.T) {
		require.Equal(t, containsTeam("team3", []string{"team1", "team2"}), false)
	})
}

func TestGetUser(t *testing.T) {
	for _, tt := range []struct {
		name          string
		expectedError error
		expectedUser  authContext.User
		prepare       func(mockClusterClient *cluster.MockClient)
	}{
		{
			name:          "could not get users",
			expectedError: fmt.Errorf("could not get users"),
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetUsers", mock.Anything, "").Return(nil, fmt.Errorf("could not get users"))
				mockClusterClient.On("GetTeams", mock.Anything, "").Return(nil, nil)
			},
		},
		{
			name:          "could not get teams",
			expectedError: fmt.Errorf("could not get teams"),
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetUsers", mock.Anything, "").Return(nil, nil)
				mockClusterClient.On("GetTeams", mock.Anything, "").Return(nil, fmt.Errorf("could not get teams"))
			},
		},
		{
			name:          "get user",
			expectedError: nil,
			expectedUser:  authContext.User{Cluster: "", Namespace: "", Name: "", ID: "admin@kobs.io", Profile: userv1.Profile{FullName: "", Email: "", Position: "", Bio: ""}, Teams: nil, Permissions: userv1.Permissions{Plugins: nil, Resources: nil}},
			prepare: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetUsers", mock.Anything, "").Return([]userv1.UserSpec{{Cluster: "", Namespace: "", Name: "", ID: "admin@kobs.io"}}, nil)
				mockClusterClient.On("GetTeams", mock.Anything, "").Return([]teamv1.TeamSpec{{Cluster: "", Namespace: "", Name: "", ID: "team1@kobs.io"}}, nil)
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

			a := Auth{
				clustersClient: mockClustersClient,
			}

			user, err := a.getUser(context.Background(), "admin@kobs.io", []string{"team1@kobs.io"})
			if tt.expectedError != nil {
				require.Error(t, err)
				require.Equal(t, tt.expectedError, err)
			} else {
				require.NoError(t, err)
				require.Equal(t, tt.expectedUser, user)
			}
		})
	}
}

func TestAuthHandler(t *testing.T) {
	for _, tt := range []struct {
		name                 string
		url                  string
		auth                 Auth
		expectedStatusCode   int
		expectedBody         string
		prepareRequest       func(r *http.Request)
		prepareClusterClient func(mockClusterClient *cluster.MockClient)
	}{
		{
			name:                 "auth disabled",
			auth:                 Auth{enabled: false},
			expectedStatusCode:   http.StatusOK,
			expectedBody:         "{\"cluster\":\"\",\"namespace\":\"\",\"name\":\"\",\"id\":\"kobs.io\",\"profile\":{\"fullName\":\"\",\"email\":\"\"},\"teams\":null,\"permissions\":{\"plugins\":[{\"name\":\"*\",\"permissions\":null}],\"resources\":[{\"clusters\":[\"*\"],\"namespaces\":[\"*\"],\"resources\":[\"*\"],\"verbs\":[\"*\"]}]}}\n",
			prepareRequest:       func(r *http.Request) {},
			prepareClusterClient: func(mockClusterClient *cluster.MockClient) {},
		},

		{
			name:                 "auth enabled, request without user id",
			auth:                 Auth{enabled: true},
			expectedStatusCode:   http.StatusUnauthorized,
			expectedBody:         "{\"error\":\"Unauthorized\"}\n",
			prepareRequest:       func(r *http.Request) {},
			prepareClusterClient: func(mockClusterClient *cluster.MockClient) {},
		},
		{
			name:               "auth enabled, request without cookie, getUser error",
			auth:               Auth{enabled: true, headerUser: "X-Auth-Request-Email"},
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"Unauthorized: could not get users\"}\n",
			prepareRequest: func(r *http.Request) {
				r.Header.Add("X-Auth-Request-Email", "admin@kobs.io")
			},
			prepareClusterClient: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetUsers", mock.Anything, "").Return(nil, fmt.Errorf("could not get users"))
				mockClusterClient.On("GetTeams", mock.Anything, "").Return(nil, fmt.Errorf("could not get teams"))
			},
		},
		{
			name:               "auth enabled, request without cookie, create token error",
			auth:               Auth{enabled: true, headerUser: "X-Auth-Request-Email", sessionInterval: -10 * time.Second},
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"Unauthorized: invalid session interval\"}\n",
			prepareRequest: func(r *http.Request) {
				r.Header.Add("X-Auth-Request-Email", "admin@kobs.io")
			},
			prepareClusterClient: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetUsers", mock.Anything, "").Return([]userv1.UserSpec{{Cluster: "", Namespace: "", Name: "", ID: "admin@kobs.io"}}, nil)
				mockClusterClient.On("GetTeams", mock.Anything, "").Return([]teamv1.TeamSpec{{Cluster: "", Namespace: "", Name: "", ID: "team1@kobs.io"}}, nil)
			},
		},
		{
			name:               "auth enabled, request without cookie, success",
			auth:               Auth{enabled: true, headerUser: "X-Auth-Request-Email"},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"cluster\":\"\",\"namespace\":\"\",\"name\":\"\",\"id\":\"admin@kobs.io\",\"profile\":{\"fullName\":\"\",\"email\":\"\"},\"teams\":null,\"permissions\":{\"plugins\":null,\"resources\":null}}\n",
			prepareRequest: func(r *http.Request) {
				r.Header.Add("X-Auth-Request-Email", "admin@kobs.io")
			},
			prepareClusterClient: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetUsers", mock.Anything, "").Return([]userv1.UserSpec{{Cluster: "", Namespace: "", Name: "", ID: "admin@kobs.io"}}, nil)
				mockClusterClient.On("GetTeams", mock.Anything, "").Return([]teamv1.TeamSpec{{Cluster: "", Namespace: "", Name: "", ID: "team1@kobs.io"}}, nil)
			},
		},

		{
			name:               "auth enabled, request with cookie, validate token error, getUser error",
			auth:               Auth{enabled: true, headerUser: "X-Auth-Request-Email"},
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"Unauthorized: could not get users\"}\n",
			prepareRequest: func(r *http.Request) {
				token, _ := jwt.CreateToken(authContext.User{}, "sessionToken", 10*time.Second)
				r.AddCookie(&http.Cookie{Name: "kobs-auth", Value: token})
				r.Header.Add("X-Auth-Request-Email", "admin@kobs.io")
			},
			prepareClusterClient: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetUsers", mock.Anything, "").Return(nil, fmt.Errorf("could not get users"))
				mockClusterClient.On("GetTeams", mock.Anything, "").Return(nil, fmt.Errorf("could not get teams"))
			},
		},
		{
			name:               "auth enabled, request with cookie, validate token error, create token error",
			auth:               Auth{enabled: true, headerUser: "X-Auth-Request-Email", sessionInterval: -10 * time.Second},
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"Unauthorized: invalid session interval\"}\n",
			prepareRequest: func(r *http.Request) {
				token, _ := jwt.CreateToken(authContext.User{}, "sessionToken", 10*time.Second)
				r.AddCookie(&http.Cookie{Name: "kobs-auth", Value: token})
				r.Header.Add("X-Auth-Request-Email", "admin@kobs.io")
			},
			prepareClusterClient: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetUsers", mock.Anything, "").Return([]userv1.UserSpec{{Cluster: "", Namespace: "", Name: "", ID: "admin@kobs.io"}}, nil)
				mockClusterClient.On("GetTeams", mock.Anything, "").Return([]teamv1.TeamSpec{{Cluster: "", Namespace: "", Name: "", ID: "team1@kobs.io"}}, nil)
			},
		},
		{
			name:               "auth enabled, request with cookie, validate token error, success",
			auth:               Auth{enabled: true, headerUser: "X-Auth-Request-Email"},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"cluster\":\"\",\"namespace\":\"\",\"name\":\"\",\"id\":\"admin@kobs.io\",\"profile\":{\"fullName\":\"\",\"email\":\"\"},\"teams\":null,\"permissions\":{\"plugins\":null,\"resources\":null}}\n",
			prepareRequest: func(r *http.Request) {
				token, _ := jwt.CreateToken(authContext.User{}, "sessionToken", 10*time.Second)
				r.AddCookie(&http.Cookie{Name: "kobs-auth", Value: token})
				r.Header.Add("X-Auth-Request-Email", "admin@kobs.io")
			},
			prepareClusterClient: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetUsers", mock.Anything, "").Return([]userv1.UserSpec{{Cluster: "", Namespace: "", Name: "", ID: "admin@kobs.io"}}, nil)
				mockClusterClient.On("GetTeams", mock.Anything, "").Return([]teamv1.TeamSpec{{Cluster: "", Namespace: "", Name: "", ID: "team1@kobs.io"}}, nil)
			},
		},
		{
			name:               "auth enabled, request with cookie, valid token, success",
			auth:               Auth{enabled: true, headerUser: "X-Auth-Request-Email"},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"cluster\":\"\",\"namespace\":\"\",\"name\":\"\",\"id\":\"\",\"profile\":{\"fullName\":\"\",\"email\":\"\"},\"teams\":null,\"permissions\":{\"plugins\":null,\"resources\":null}}\n",
			prepareRequest: func(r *http.Request) {
				token, _ := jwt.CreateToken(authContext.User{}, "", 10*time.Second)
				r.AddCookie(&http.Cookie{Name: "kobs-auth", Value: token})
				r.Header.Add("X-Auth-Request-Email", "admin@kobs.io")
			},
			prepareClusterClient: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetUsers", mock.Anything, "").Return([]userv1.UserSpec{{Cluster: "", Namespace: "", Name: "", ID: "admin@kobs.io"}}, nil)
				mockClusterClient.On("GetTeams", mock.Anything, "").Return([]teamv1.TeamSpec{{Cluster: "", Namespace: "", Name: "", ID: "team1@kobs.io"}}, nil)
			},
		},
		{
			name:               "auth enabled, plugin request, forbidden",
			url:                "/api/plugins/test",
			auth:               Auth{enabled: true, headerUser: "X-Auth-Request-Email"},
			expectedStatusCode: http.StatusForbidden,
			expectedBody:       "{\"error\":\"Your are not allowed to access the plugin\"}\n",
			prepareRequest: func(r *http.Request) {
				r.Header.Add("X-Auth-Request-Email", "admin@kobs.io")
			},
			prepareClusterClient: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetUsers", mock.Anything, "").Return([]userv1.UserSpec{{Cluster: "", Namespace: "", Name: "", ID: "admin@kobs.io"}}, nil)
				mockClusterClient.On("GetTeams", mock.Anything, "").Return([]teamv1.TeamSpec{{Cluster: "", Namespace: "", Name: "", ID: "team1@kobs.io"}}, nil)
			},
		},
		{
			name:               "auth enabled, plugin request, allowed",
			url:                "/api/plugins/test",
			auth:               Auth{enabled: true, headerUser: "X-Auth-Request-Email"},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"cluster\":\"\",\"namespace\":\"\",\"name\":\"\",\"id\":\"admin@kobs.io\",\"profile\":{\"fullName\":\"\",\"email\":\"\"},\"teams\":null,\"permissions\":{\"plugins\":[{\"name\":\"*\",\"permissions\":null}],\"resources\":null}}\n",
			prepareRequest: func(r *http.Request) {
				r.Header.Add("X-Auth-Request-Email", "admin@kobs.io")
			},
			prepareClusterClient: func(mockClusterClient *cluster.MockClient) {
				mockClusterClient.On("GetUsers", mock.Anything, "").Return([]userv1.UserSpec{{Cluster: "", Namespace: "", Name: "", ID: "admin@kobs.io", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Name: "*"}}}}}, nil)
				mockClusterClient.On("GetTeams", mock.Anything, "").Return([]teamv1.TeamSpec{{Cluster: "", Namespace: "", Name: "", ID: "team1@kobs.io"}}, nil)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockClusterClient := &cluster.MockClient{}
			mockClusterClient.AssertExpectations(t)

			mockClustersClient := &clusters.MockClient{}
			mockClustersClient.AssertExpectations(t)
			mockClustersClient.On("GetClusters").Return([]cluster.Client{mockClusterClient})

			tt.prepareClusterClient(mockClusterClient)
			tt.auth.clustersClient = mockClustersClient

			url := "/"
			if tt.url != "" {
				url = tt.url
			}

			router := chi.NewRouter()
			router.Use(tt.auth.Handler)
			router.Get(url, UserHandler)

			req, _ := http.NewRequest(http.MethodGet, url, nil)
			tt.prepareRequest(req)

			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestNew(t *testing.T) {
	require.NotEmpty(t, New(false, "", "", "", 10*time.Second, &clusters.MockClient{}))
}
