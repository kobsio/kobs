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

func TestGetUser(t *testing.T) {
	for _, tt := range []struct {
		name          string
		expectedError error
		expectedUser  authContext.User
		prepare       func(mockStoreClient *store.MockClient)
	}{
		{
			name:          "could not get users",
			expectedError: fmt.Errorf("could not get users"),
			prepare: func(mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetUsersByEmail", mock.Anything, "user1@kobs.io").Return(nil, fmt.Errorf("could not get users"))
			},
		},
		{
			name:          "could not get teams",
			expectedError: fmt.Errorf("could not get teams"),
			prepare: func(mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetUsersByEmail", mock.Anything, "user1@kobs.io").Return(nil, nil)
				mockStoreClient.On("GetTeamsByGroups", mock.Anything, []string{"team1@kobs.io"}).Return(nil, fmt.Errorf("could not get teams"))
			},
		},
		{
			name:          "get user",
			expectedError: nil,
			expectedUser:  authContext.User{Email: "user1@kobs.io", Teams: []string{"team1@kobs.io"}, Permissions: userv1.Permissions{Teams: nil, Plugins: nil, Resources: nil}},
			prepare: func(mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetUsersByEmail", mock.Anything, "user1@kobs.io").Return([]userv1.UserSpec{{Cluster: "", Namespace: "", Name: "", Email: "user1@kobs.io"}}, nil)
				mockStoreClient.On("GetTeamsByGroups", mock.Anything, []string{"team1@kobs.io"}).Return([]teamv1.TeamSpec{{Cluster: "", Namespace: "", Name: "", Group: "team1@kobs.io"}}, nil)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockStoreClient := &store.MockClient{}

			tt.prepare(mockStoreClient)

			a := Auth{
				storeClient: mockStoreClient,
			}

			user, err := a.getUser(context.Background(), "user1@kobs.io", []string{"team1@kobs.io"})
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
		name               string
		url                string
		auth               Auth
		expectedStatusCode int
		expectedBody       string
		prepareRequest     func(r *http.Request)
		prepareStoreClient func(mockStoreClient *store.MockClient)
	}{
		{
			name:               "auth disabled",
			auth:               Auth{enabled: false},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"email\":\"\",\"teams\":[\"*\"],\"permissions\":{\"teams\":[\"*\"],\"plugins\":[{\"satellite\":\"*\",\"name\":\"*\",\"permissions\":null}],\"resources\":[{\"satellites\":[\"*\"],\"clusters\":[\"*\"],\"namespaces\":[\"*\"],\"resources\":[\"*\"],\"verbs\":[\"*\"]}]}}\n",
			prepareRequest:     func(r *http.Request) {},
			prepareStoreClient: func(mockStoreClient *store.MockClient) {},
		},
		{
			name:               "auth enabled, request without user email",
			auth:               Auth{enabled: true},
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"Unauthorized\"}\n",
			prepareRequest:     func(r *http.Request) {},
			prepareStoreClient: func(mockStoreClient *store.MockClient) {
				mockStoreClient.AssertNotCalled(t, "GetUsersByEmail", mock.Anything, mock.Anything)
				mockStoreClient.AssertNotCalled(t, "GetTeamsByGroups", mock.Anything, mock.Anything)
			},
		},
		{
			name:               "auth enabled, request without cookie, getUser error",
			auth:               Auth{enabled: true, headerUser: "X-Auth-Request-Email"},
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"Unauthorized: could not get users\"}\n",
			prepareRequest: func(r *http.Request) {
				r.Header.Add("X-Auth-Request-Email", "user1@kobs.io")
			},
			prepareStoreClient: func(mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetUsersByEmail", mock.Anything, "user1@kobs.io").Return(nil, fmt.Errorf("could not get users"))
				mockStoreClient.AssertNotCalled(t, "GetTeamsByGroups", mock.Anything, mock.Anything)
			},
		},
		{
			name:               "auth enabled, request without cookie and teams, getUser error",
			auth:               Auth{enabled: true, headerUser: "X-Auth-Request-Email", headerTeams: "X-Auth-Request-Groups"},
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"Unauthorized: could not get teams\"}\n",
			prepareRequest: func(r *http.Request) {
				r.Header.Add("X-Auth-Request-Email", "user1@kobs.io")
				r.Header.Add("X-Auth-Request-Groups", "team1@kobs.io")
			},
			prepareStoreClient: func(mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetUsersByEmail", mock.Anything, "user1@kobs.io").Return(nil, nil)
				mockStoreClient.On("GetTeamsByGroups", mock.Anything, []string{"team1@kobs.io"}).Return(nil, fmt.Errorf("could not get teams"))
			},
		},
		{
			name:               "auth enabled, request without cookie, create token error",
			auth:               Auth{enabled: true, headerUser: "X-Auth-Request-Email", sessionInterval: -10 * time.Second},
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"Unauthorized: invalid session interval\"}\n",
			prepareRequest: func(r *http.Request) {
				r.Header.Add("X-Auth-Request-Email", "user1@kobs.io")
			},
			prepareStoreClient: func(mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetUsersByEmail", mock.Anything, "user1@kobs.io").Return([]userv1.UserSpec{{Cluster: "", Namespace: "", Name: "", Email: "user1@kobs.io"}}, nil)
				mockStoreClient.AssertNotCalled(t, "GetTeamsByGroups", mock.Anything, mock.Anything)
			},
		},
		{
			name:               "auth enabled, request without cookie, success",
			auth:               Auth{enabled: true, headerUser: "X-Auth-Request-Email"},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"email\":\"user1@kobs.io\",\"teams\":null,\"permissions\":{\"teams\":null,\"plugins\":null,\"resources\":null}}\n",
			prepareRequest: func(r *http.Request) {
				r.Header.Add("X-Auth-Request-Email", "user1@kobs.io")
			},
			prepareStoreClient: func(mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetUsersByEmail", mock.Anything, "user1@kobs.io").Return([]userv1.UserSpec{{Cluster: "", Namespace: "", Name: "", Email: "user1@kobs.io"}}, nil)
				mockStoreClient.AssertNotCalled(t, "GetTeamsByGroups", mock.Anything, mock.Anything)
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
				r.Header.Add("X-Auth-Request-Email", "user1@kobs.io")
			},
			prepareStoreClient: func(mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetUsersByEmail", mock.Anything, "user1@kobs.io").Return(nil, fmt.Errorf("could not get users"))
				mockStoreClient.AssertNotCalled(t, "GetTeamsByGroups", mock.Anything, mock.Anything)
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
				r.Header.Add("X-Auth-Request-Email", "user1@kobs.io")
			},
			prepareStoreClient: func(mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetUsersByEmail", mock.Anything, "user1@kobs.io").Return([]userv1.UserSpec{{Cluster: "", Namespace: "", Name: "", Email: "user1@kobs.io"}}, nil)
				mockStoreClient.AssertNotCalled(t, "GetTeamsByGroups", mock.Anything, mock.Anything)
			},
		},
		{
			name:               "auth enabled, request with cookie, validate token error, success",
			auth:               Auth{enabled: true, headerUser: "X-Auth-Request-Email"},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"email\":\"user1@kobs.io\",\"teams\":null,\"permissions\":{\"teams\":null,\"plugins\":null,\"resources\":null}}\n",
			prepareRequest: func(r *http.Request) {
				token, _ := jwt.CreateToken(authContext.User{}, "sessionToken", 10*time.Second)
				r.AddCookie(&http.Cookie{Name: "kobs-auth", Value: token})
				r.Header.Add("X-Auth-Request-Email", "user1@kobs.io")
			},
			prepareStoreClient: func(mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetUsersByEmail", mock.Anything, "user1@kobs.io").Return([]userv1.UserSpec{{Cluster: "", Namespace: "", Name: "", Email: "user1@kobs.io"}}, nil)
				mockStoreClient.AssertNotCalled(t, "GetTeamsByGroups", mock.Anything, mock.Anything)
			},
		},
		{
			name:               "auth enabled, request with cookie, valid token, success",
			auth:               Auth{enabled: true, headerUser: "X-Auth-Request-Email"},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"email\":\"user1@kobs.io\",\"teams\":null,\"permissions\":{\"teams\":null,\"plugins\":null,\"resources\":null}}\n",
			prepareRequest: func(r *http.Request) {
				token, _ := jwt.CreateToken(authContext.User{Email: "user1@kobs.io"}, "", 10*time.Minute)
				r.AddCookie(&http.Cookie{Name: "kobs-auth", Value: token})
				r.Header.Add("X-Auth-Request-Email", "user1@kobs.io")
			},
			prepareStoreClient: func(mockStoreClient *store.MockClient) {
				mockStoreClient.AssertNotCalled(t, "GetUsersByEmail", mock.Anything, mock.Anything)
				mockStoreClient.AssertNotCalled(t, "GetTeamsByGroups", mock.Anything, mock.Anything)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockStoreClient := &store.MockClient{}

			tt.prepareStoreClient(mockStoreClient)
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
