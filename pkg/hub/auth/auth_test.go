package auth

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/auth/jwt"
	"github.com/kobsio/kobs/pkg/hub/store"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"golang.org/x/oauth2"
)

func TestMiddlewareHandler(t *testing.T) {
	mockStoreClient := &store.MockClient{}
	mockStoreClient.On("GetUsersByEmail", mock.Anything, "user1@kobs.io").Return([]userv1.UserSpec{{Cluster: "", Namespace: "", Name: "", Email: "user1@kobs.io"}}, nil)
	mockStoreClient.On("GetTeamsByGroups", mock.Anything, []string{"team1@kobs.io"}).Return([]teamv1.TeamSpec{{Cluster: "", Namespace: "", Name: "", Group: "team1@kobs.io"}}, nil)

	for _, tt := range []struct {
		name               string
		client             client
		expectedStatusCode int
		expectedBody       string
		prepareRequest     func(r *http.Request)
	}{
		{
			name:               "auth disabled",
			client:             client{config: Config{Enabled: false}},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepareRequest:     func(r *http.Request) {},
		},
		{
			name:               "auth enabled, request without cookie",
			client:             client{config: Config{Enabled: true}},
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"Unauthorized: http: named cookie not present\"}\n",
			prepareRequest:     func(r *http.Request) {},
		},
		{
			name:               "auth enabled, request with invalid cookie",
			client:             client{config: Config{Enabled: true}},
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"Unauthorized: token contains an invalid number of segments\"}\n",
			prepareRequest: func(r *http.Request) {
				r.AddCookie(&http.Cookie{Name: "kobs", Value: "fake"})
			},
		},
		{
			name:               "auth enabled, request with cookie",
			client:             client{config: Config{Enabled: true}, storeClient: mockStoreClient},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepareRequest: func(r *http.Request) {
				token, _ := jwt.CreateToken(&authContext.User{Email: "user1@kobs.io"}, "", 10*time.Minute)
				r.AddCookie(&http.Cookie{Name: "kobs", Value: token})
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			router := chi.NewRouter()
			router.Use(tt.client.MiddlewareHandler)
			router.Get("/", func(w http.ResponseWriter, r *http.Request) {
				render.JSON(w, r, nil)
			})

			req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/", nil)
			tt.prepareRequest(req)

			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestMount(t *testing.T) {
	c := client{
		router: chi.NewRouter(),
	}

	require.NotNil(t, c.Mount())
}

func TestGetUserFromStore(t *testing.T) {
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

			c := client{
				storeClient: mockStoreClient,
			}

			user, err := c.getUserFromStore(context.Background(), "user1@kobs.io", []string{"team1@kobs.io"})
			if tt.expectedError != nil {
				require.Error(t, err)
				require.Equal(t, tt.expectedError, err)
			} else {
				require.NoError(t, err)
				require.Equal(t, tt.expectedUser, *user)
			}
			mockStoreClient.AssertExpectations(t)
		})
	}
}

func TestGetUserFromConfig(t *testing.T) {
	c := client{
		config: Config{Users: []UserConfig{{Email: "admin"}}},
	}

	require.Equal(t, &UserConfig{Email: "admin"}, c.getUserFromConfig("admin"))
	require.Nil(t, c.getUserFromConfig("test"))
}

func TestUserHandler(t *testing.T) {
	mockStoreClient := &store.MockClient{}
	mockStoreClient.On("GetUsersByEmail", mock.Anything, "user1@kobs.io").Return([]userv1.UserSpec{{Cluster: "", Namespace: "", Name: "", Email: "user1@kobs.io"}}, nil)
	mockStoreClient.On("GetTeamsByGroups", mock.Anything, []string{"team1@kobs.io"}).Return([]teamv1.TeamSpec{{Cluster: "", Namespace: "", Name: "", Group: "team1@kobs.io"}}, nil)

	for _, tt := range []struct {
		name               string
		client             client
		expectedStatusCode int
		expectedBody       string
		prepareRequest     func(r *http.Request)
	}{
		{
			name:               "auth disabled",
			client:             client{config: Config{Enabled: false}},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"email\":\"\",\"teams\":null,\"permissions\":{\"applications\":[{\"type\":\"all\"}],\"teams\":[\"*\"],\"plugins\":[{\"satellite\":\"*\",\"name\":\"*\",\"type\":\"*\",\"permissions\":null}],\"resources\":[{\"satellites\":[\"*\"],\"clusters\":[\"*\"],\"namespaces\":[\"*\"],\"resources\":[\"*\"],\"verbs\":[\"*\"]}]}}\n",
			prepareRequest:     func(r *http.Request) {},
		},
		{
			name:               "auth enabled, request without cookie",
			client:             client{config: Config{Enabled: true}},
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"Unauthorized: http: named cookie not present\"}\n",
			prepareRequest:     func(r *http.Request) {},
		},
		{
			name:               "auth enabled, request with invalid cookie",
			client:             client{config: Config{Enabled: true}},
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"Unauthorized: token contains an invalid number of segments\"}\n",
			prepareRequest: func(r *http.Request) {
				r.AddCookie(&http.Cookie{Name: "kobs", Value: "fake"})
			},
		},
		{
			name:               "auth enabled, request with cookie",
			client:             client{config: Config{Enabled: true}, storeClient: mockStoreClient},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"email\":\"user1@kobs.io\",\"teams\":null,\"permissions\":{}}\n",
			prepareRequest: func(r *http.Request) {
				token, _ := jwt.CreateToken(&authContext.User{Email: "user1@kobs.io"}, "", 10*time.Minute)
				r.AddCookie(&http.Cookie{Name: "kobs", Value: token})
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/", nil)
			tt.prepareRequest(req)
			w := httptest.NewRecorder()
			tt.client.userHandler(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestSigninHandler(t *testing.T) {
	for _, tt := range []struct {
		name               string
		client             client
		requestBody        string
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name:               "signin without body",
			client:             client{config: Config{Enabled: true}},
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not decode request body: EOF\"}\n",
		},
		{
			name:               "signin, user not found",
			client:             client{config: Config{Enabled: true}},
			requestBody:        "{\"email\":\"admin\", \"password\":\"admin\"}\n",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Invalid email or password\"}\n",
		},
		{
			name:               "signin, wrong password",
			client:             client{config: Config{Enabled: true, Users: []UserConfig{{Email: "admin", Password: "$2y$10$UPPBv.HThEllgJZINbFwYOsru62d.LT0EqG3XLug2pG81IvemopH2"}}}},
			requestBody:        "{\"email\":\"admin\", \"password\":\"admin\"}\n",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Invalid email or password\"}\n",
		},
		{
			name:               "signin create token error",
			client:             client{config: Config{Enabled: true, Session: SessionConfig{ParsedInterval: -1 * time.Minute}, Users: []UserConfig{{Email: "admin", Password: "$2y$10$UPPBv.HThEllgJZINbFwYOsru62d.LT0EqG3XLug2pG81IvemopH2"}}}},
			requestBody:        "{\"email\":\"admin\", \"password\":\"fakepassword\"}\n",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not create jwt token: invalid session interval\"}\n",
		},
		{
			name:               "signin succeeded",
			client:             client{config: Config{Enabled: true, Users: []UserConfig{{Email: "admin", Password: "$2y$10$UPPBv.HThEllgJZINbFwYOsru62d.LT0EqG3XLug2pG81IvemopH2"}}}},
			requestBody:        "{\"email\":\"admin\", \"password\":\"fakepassword\"}\n",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, "/", bytes.NewBuffer([]byte(tt.requestBody)))
			w := httptest.NewRecorder()
			tt.client.signinHandler(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestSignoutHandler(t *testing.T) {
	c := client{
		router: chi.NewRouter(),
	}

	req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/", nil)
	req.AddCookie(&http.Cookie{
		Name:     "kobs",
		Value:    "1234",
		Path:     "/",
		Secure:   true,
		HttpOnly: true,
		Expires:  time.Unix(0, 0),
	})
	w := httptest.NewRecorder()
	c.signoutHandler(w, req)
	require.Equal(t, http.StatusOK, w.Code)
}

func TestOidcHandler(t *testing.T) {
	t.Run("oidc not configured", func(t *testing.T) {
		c := client{
			router: chi.NewRouter(),
		}

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/", nil)
		w := httptest.NewRecorder()
		c.oidcHandler(w, req)
		require.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("redirect", func(t *testing.T) {
		oidcProvider, _ := oidc.NewProvider(context.Background(), "https://accounts.google.com")
		oidcConfig := &oauth2.Config{
			ClientID:     "",
			ClientSecret: "",
			RedirectURL:  "http://localhost:3000",
			Endpoint:     oidcProvider.Endpoint(),
			Scopes:       []string{"openid", "profile", "email", "groups"},
		}

		c := client{
			router:       chi.NewRouter(),
			oidcConfig:   oidcConfig,
			oidcProvider: oidcProvider,
		}

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/", nil)
		w := httptest.NewRecorder()
		c.oidcHandler(w, req)
		require.Equal(t, http.StatusOK, w.Code)
	})
}

func TestNewClient(t *testing.T) {
	t.Run("new client", func(t *testing.T) {
		client, err := NewClient(Config{}, nil)
		require.NotNil(t, client)
		require.NoError(t, err)
	})

	t.Run("new client with oidc", func(t *testing.T) {
		client, err := NewClient(Config{OIDC: OIDCConfig{Enabled: true, Issuer: "https://accounts.google.com", Scopes: []string{"openid", "profile", "email"}}, Session: SessionConfig{Interval: "5m"}}, nil)
		require.NotNil(t, client)
		require.NoError(t, err)
	})

	t.Run("new client with oidc error", func(t *testing.T) {
		client, err := NewClient(Config{OIDC: OIDCConfig{Enabled: true, Issuer: "https://kobs.io"}}, nil)
		require.Nil(t, client)
		require.Error(t, err)
	})
}
