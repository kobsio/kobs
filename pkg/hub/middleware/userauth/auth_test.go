package userauth

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
	"github.com/kobsio/kobs/pkg/hub/middleware/userauth/jwt"
	"github.com/kobsio/kobs/pkg/hub/store"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestIsTeamInTeamIDs(t *testing.T) {
	t.Run("teams contain team", func(t *testing.T) {
		require.Equal(t, isTeamInTeamIDs("team1", []string{"team1", "team2"}), true)
	})

	t.Run("teams not contain team", func(t *testing.T) {
		require.Equal(t, isTeamInTeamIDs("team3", []string{"team1", "team2"}), false)
	})
}

func TestIsTeamInTeams(t *testing.T) {
	t.Run("teams contain team", func(t *testing.T) {
		require.Equal(t, isTeamInTeams(teamv1.TeamSpec{Cluster: "test", Namespace: "kobs", Name: "team1"}, []userv1.TeamReference{{Cluster: "test", Namespace: "kobs", Name: "team1"}}), true)
	})

	t.Run("teams not contain team", func(t *testing.T) {
		require.Equal(t, isTeamInTeams(teamv1.TeamSpec{Cluster: "test", Namespace: "kobs", Name: "team1"}, []userv1.TeamReference{}), false)
	})
}

func TestGetUser(t *testing.T) {
	for _, tt := range []struct {
		name          string
		expectedError error
		expectedUser  authContext.User
		prepare       func(mockStoreClient *store.MockClient)
	}{
		{
			name:          "could not get clusters",
			expectedError: fmt.Errorf("could not get clusters"),
			prepare: func(mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetClusters", mock.Anything).Return(nil, fmt.Errorf("could not get clusters"))
			},
		},
		{
			name:          "could not get users",
			expectedError: fmt.Errorf("could not get users"),
			prepare: func(mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetClusters", mock.Anything).Return([]string{"c1"}, nil)
				mockStoreClient.On("GetUsersByCluster", mock.Anything, "c1", -1, 0).Return(nil, fmt.Errorf("could not get users"))
			},
		},
		{
			name:          "could not get teams",
			expectedError: fmt.Errorf("could not get teams"),
			prepare: func(mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetClusters", mock.Anything).Return([]string{"c1"}, nil)
				mockStoreClient.On("GetUsersByCluster", mock.Anything, "c1", -1, 0).Return(nil, nil)
				mockStoreClient.On("GetTeamsByCluster", mock.Anything, "c1", -1, 0).Return(nil, fmt.Errorf("could not get teams"))
			},
		},
		{
			name:          "get user",
			expectedError: nil,
			expectedUser:  authContext.User{Cluster: "c1", Namespace: "", Name: "", ID: "admin@kobs.io", Profile: userv1.Profile{FullName: "", Email: "", Position: "", Bio: ""}, Teams: []userv1.TeamReference{{Cluster: "c1", Namespace: "", Name: ""}}, Permissions: userv1.Permissions{Plugins: nil, Resources: nil}},
			prepare: func(mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetClusters", mock.Anything).Return([]string{"c1"}, nil)
				mockStoreClient.On("GetUsersByCluster", mock.Anything, "c1", -1, 0).Return([]userv1.UserSpec{{Cluster: "c1", Namespace: "", Name: "", ID: "admin@kobs.io"}}, nil)
				mockStoreClient.On("GetTeamsByCluster", mock.Anything, "c1", -1, 0).Return([]teamv1.TeamSpec{{Cluster: "c1", Namespace: "", Name: "", ID: "team1@kobs.io"}}, nil)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockStoreClient := &store.MockClient{}

			tt.prepare(mockStoreClient)

			a := Auth{
				storeClient: mockStoreClient,
			}

			user, err := a.getUser(context.Background(), "admin@kobs.io", []string{"team1@kobs.io"})
			if tt.expectedError != nil {
				require.Error(t, err)
				require.Equal(t, tt.expectedError, err)
			} else {
				require.NoError(t, err)
				require.Equal(t, tt.expectedUser, user)
			}
			mockStoreClient.AssertExpectations(t)
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
		prepareClusterClient func(mockStoreClient *store.MockClient)
	}{
		{
			name:                 "auth disabled",
			auth:                 Auth{enabled: false},
			expectedStatusCode:   http.StatusOK,
			expectedBody:         "{\"cluster\":\"\",\"namespace\":\"\",\"name\":\"\",\"id\":\"kobs.io\",\"profile\":{\"fullName\":\"\",\"email\":\"\"},\"teams\":null,\"permissions\":{\"plugins\":[{\"name\":\"*\",\"permissions\":null}],\"resources\":[{\"clusters\":[\"*\"],\"namespaces\":[\"*\"],\"resources\":[\"*\"],\"verbs\":[\"*\"]}]},\"rows\":null}\n",
			prepareRequest:       func(r *http.Request) {},
			prepareClusterClient: func(mockStoreClient *store.MockClient) {},
		},
		{
			name:                 "auth enabled, request without user id",
			auth:                 Auth{enabled: true},
			expectedStatusCode:   http.StatusUnauthorized,
			expectedBody:         "{\"error\":\"Unauthorized\"}\n",
			prepareRequest:       func(r *http.Request) {},
			prepareClusterClient: func(mockStoreClient *store.MockClient) {},
		},
		{
			name:               "auth enabled, request without cookie, getClusters error",
			auth:               Auth{enabled: true, headerUser: "X-Auth-Request-Email"},
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"Unauthorized: could not get clusters\"}\n",
			prepareRequest: func(r *http.Request) {
				r.Header.Add("X-Auth-Request-Email", "admin@kobs.io")
			},
			prepareClusterClient: func(mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetClusters", mock.Anything).Return(nil, fmt.Errorf("could not get clusters"))
				mockStoreClient.AssertNotCalled(t, "GetUsersByCluster", mock.Anything, "c1", -1, 0)
				mockStoreClient.AssertNotCalled(t, "GetTeamsByCluster", mock.Anything, "c1", -1, 0)
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
			prepareClusterClient: func(mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetClusters", mock.Anything).Return([]string{"c1"}, nil)
				mockStoreClient.On("GetUsersByCluster", mock.Anything, "c1", -1, 0).Return([]userv1.UserSpec{{Cluster: "c1", Namespace: "", Name: "", ID: "admin@kobs.io"}}, nil)
				mockStoreClient.On("GetTeamsByCluster", mock.Anything, "c1", -1, 0).Return([]teamv1.TeamSpec{{Cluster: "c1", Namespace: "", Name: "", ID: "team1@kobs.io"}}, nil)
			},
		},
		{
			name:               "auth enabled, request without cookie, success",
			auth:               Auth{enabled: true, headerUser: "X-Auth-Request-Email"},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"cluster\":\"c1\",\"namespace\":\"\",\"name\":\"\",\"id\":\"admin@kobs.io\",\"profile\":{\"fullName\":\"\",\"email\":\"\"},\"teams\":null,\"permissions\":{\"plugins\":null,\"resources\":null},\"rows\":null}\n",
			prepareRequest: func(r *http.Request) {
				r.Header.Add("X-Auth-Request-Email", "admin@kobs.io")
			},
			prepareClusterClient: func(mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetClusters", mock.Anything).Return([]string{"c1"}, nil)
				mockStoreClient.On("GetUsersByCluster", mock.Anything, "c1", -1, 0).Return([]userv1.UserSpec{{Cluster: "c1", Namespace: "", Name: "", ID: "admin@kobs.io"}}, nil)
				mockStoreClient.On("GetTeamsByCluster", mock.Anything, "c1", -1, 0).Return([]teamv1.TeamSpec{{Cluster: "c1", Namespace: "", Name: "", ID: "team1@kobs.io"}}, nil)
			},
		},

		{
			name:               "auth enabled, request with cookie, validate token error, getClusters error",
			auth:               Auth{enabled: true, headerUser: "X-Auth-Request-Email"},
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"Unauthorized: could not get clusters\"}\n",
			prepareRequest: func(r *http.Request) {
				token, _ := jwt.CreateToken(authContext.User{}, "sessionToken", 10*time.Second)
				r.AddCookie(&http.Cookie{Name: "kobs-auth", Value: token})
				r.Header.Add("X-Auth-Request-Email", "admin@kobs.io")
			},
			prepareClusterClient: func(mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetClusters", mock.Anything).Return(nil, fmt.Errorf("could not get clusters"))
				mockStoreClient.AssertNotCalled(t, "GetUsersByCluster", mock.Anything, "", -1, 0)
				mockStoreClient.AssertNotCalled(t, "GetTeamsByCluster", mock.Anything, "", -1, 0)
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
			prepareClusterClient: func(mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetClusters", mock.Anything).Return([]string{"c1"}, nil)
				mockStoreClient.On("GetUsersByCluster", mock.Anything, "c1", -1, 0).Return([]userv1.UserSpec{{Cluster: "c1", Namespace: "", Name: "", ID: "admin@kobs.io"}}, nil)
				mockStoreClient.On("GetTeamsByCluster", mock.Anything, "c1", -1, 0).Return([]teamv1.TeamSpec{{Cluster: "c1", Namespace: "", Name: "", ID: "team1@kobs.io"}}, nil)
			},
		},
		{
			name:               "auth enabled, request with cookie, validate token error, success",
			auth:               Auth{enabled: true, headerUser: "X-Auth-Request-Email"},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"cluster\":\"c1\",\"namespace\":\"\",\"name\":\"\",\"id\":\"admin@kobs.io\",\"profile\":{\"fullName\":\"\",\"email\":\"\"},\"teams\":null,\"permissions\":{\"plugins\":null,\"resources\":null},\"rows\":null}\n",
			prepareRequest: func(r *http.Request) {
				token, _ := jwt.CreateToken(authContext.User{}, "sessionToken", 10*time.Second)
				r.AddCookie(&http.Cookie{Name: "kobs-auth", Value: token})
				r.Header.Add("X-Auth-Request-Email", "admin@kobs.io")
			},
			prepareClusterClient: func(mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetClusters", mock.Anything).Return([]string{"c1"}, nil)
				mockStoreClient.On("GetUsersByCluster", mock.Anything, "c1", -1, 0).Return([]userv1.UserSpec{{Cluster: "c1", Namespace: "", Name: "", ID: "admin@kobs.io"}}, nil)
				mockStoreClient.On("GetTeamsByCluster", mock.Anything, "c1", -1, 0).Return([]teamv1.TeamSpec{{Cluster: "c1", Namespace: "", Name: "", ID: "team1@kobs.io"}}, nil)
			},
		},
		{
			name:               "auth enabled, request with cookie, valid token, success",
			auth:               Auth{enabled: true, headerUser: "X-Auth-Request-Email"},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"cluster\":\"\",\"namespace\":\"\",\"name\":\"\",\"id\":\"\",\"profile\":{\"fullName\":\"\",\"email\":\"\"},\"teams\":null,\"permissions\":{\"plugins\":null,\"resources\":null},\"rows\":null}\n",
			prepareRequest: func(r *http.Request) {
				token, _ := jwt.CreateToken(authContext.User{}, "", 10*time.Minute)
				r.AddCookie(&http.Cookie{Name: "kobs-auth", Value: token})
				r.Header.Add("X-Auth-Request-Email", "admin@kobs.io")
			},
			prepareClusterClient: func(mockStoreClient *store.MockClient) {},
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
			prepareClusterClient: func(mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetClusters", mock.Anything).Return([]string{"c1"}, nil)
				mockStoreClient.On("GetUsersByCluster", mock.Anything, "c1", -1, 0).Return([]userv1.UserSpec{{Cluster: "c1", Namespace: "", Name: "", ID: "admin@kobs.io"}}, nil)
				mockStoreClient.On("GetTeamsByCluster", mock.Anything, "c1", -1, 0).Return([]teamv1.TeamSpec{{Cluster: "c1", Namespace: "", Name: "", ID: "team1@kobs.io"}}, nil)
			},
		},
		{
			name:               "auth enabled, plugin request, allowed",
			url:                "/api/plugins/test",
			auth:               Auth{enabled: true, headerUser: "X-Auth-Request-Email"},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"cluster\":\"c1\",\"namespace\":\"\",\"name\":\"\",\"id\":\"admin@kobs.io\",\"profile\":{\"fullName\":\"\",\"email\":\"\"},\"teams\":null,\"permissions\":{\"plugins\":[{\"name\":\"*\",\"permissions\":null}],\"resources\":null},\"rows\":null}\n",
			prepareRequest: func(r *http.Request) {
				r.Header.Add("X-Auth-Request-Email", "admin@kobs.io")
			},
			prepareClusterClient: func(mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetClusters", mock.Anything).Return([]string{"c1"}, nil)
				mockStoreClient.On("GetUsersByCluster", mock.Anything, "c1", -1, 0).Return([]userv1.UserSpec{{Cluster: "c1", Namespace: "", Name: "", ID: "admin@kobs.io", Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Name: "*"}}}}}, nil)
				mockStoreClient.On("GetTeamsByCluster", mock.Anything, "c1", -1, 0).Return([]teamv1.TeamSpec{{Cluster: "c1", Namespace: "", Name: "", ID: "team1@kobs.io"}}, nil)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockStoreClient := &store.MockClient{}

			tt.prepareClusterClient(mockStoreClient)
			tt.auth.storeClient = mockStoreClient

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
			mockStoreClient.AssertExpectations(t)
		})
	}
}

func TestNew(t *testing.T) {
	require.NotEmpty(t, New(false, "", "", "", 10*time.Second, &store.MockClient{}))
}
