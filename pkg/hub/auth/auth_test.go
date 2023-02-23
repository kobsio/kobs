package auth

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	teamv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"
	"github.com/kobsio/kobs/pkg/hub/app/settings"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/auth/jwt"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/go-chi/chi/v5"
	gomock "github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/oauth2"
)

func TestAuthMiddleware(t *testing.T) {
	t.Run("should succeed when cookie contains valid session", func(t *testing.T) {
		sessionID := primitive.NewObjectID()
		session := &db.Session{
			ID: sessionID,
			User: authContext.User{
				ID:          "test@kobs.io",
				Teams:       []string{"team@kobs.io"},
				Permissions: userv1.Permissions{Teams: []string{"team@kobs.io"}},
			},
		}

		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetSession(gomock.Any(), sessionID).Return(session, nil)

		client := client{config: Config{Session: SessionConfig{Token: "1234"}}, dbClient: dbClient}
		nxt := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userFromCtx, userIsSet := r.Context().Value(authContext.UserKey).(authContext.User)
			require.True(t, userIsSet)
			require.Equal(t, authContext.User{
				ID:          session.User.ID,
				Teams:       session.User.Permissions.Teams,
				Permissions: session.User.Permissions,
			}, userFromCtx)
			w.WriteHeader(http.StatusAccepted)
		})
		handler := client.MiddlewareHandler(nxt)

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/", nil)

		token, err := jwt.CreateToken(&Token{SessionID: sessionID}, client.config.Session.Token, time.Hour)
		require.NoError(t, err)

		req.AddCookie(
			&http.Cookie{
				Name:     "kobs.token",
				Value:    token,
				Path:     "/",
				Secure:   true,
				HttpOnly: true,
				Expires:  time.Now().Add(time.Hour),
			},
		)

		w := httptest.NewRecorder()
		handler.ServeHTTP(w, req)
		utils.AssertStatusEq(t, w, http.StatusAccepted)
	})

	t.Run("should fail when no cookie is set", func(t *testing.T) {
		client := client{config: Config{Session: SessionConfig{Token: "1234"}}}
		nxt := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusAccepted)
		})
		handler := client.MiddlewareHandler(nxt)

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/", nil)

		w := httptest.NewRecorder()
		handler.ServeHTTP(w, req)
		utils.AssertStatusEq(t, w, http.StatusUnauthorized)
	})

	t.Run("should fail when token in cookie is invalid", func(t *testing.T) {
		client := client{config: Config{Session: SessionConfig{Token: "1234"}}}
		nxt := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		})
		handler := client.MiddlewareHandler(nxt)

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/", nil)

		token, err := jwt.CreateToken(&Token{SessionID: primitive.NewObjectID()}, client.config.Session.Token+"to make signature invalid", time.Hour)
		require.NoError(t, err)

		req.AddCookie(
			&http.Cookie{
				Name:     "kobs.token",
				Value:    token,
				Path:     "/",
				Secure:   true,
				HttpOnly: true,
				Expires:  time.Now().Add(time.Hour),
			},
		)

		w := httptest.NewRecorder()
		handler.ServeHTTP(w, req)
		utils.AssertStatusEq(t, w, http.StatusUnauthorized)
	})

	t.Run("should fail when session can not be found in database", func(t *testing.T) {
		sessionID := primitive.NewObjectID()

		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetSession(gomock.Any(), sessionID).Return(nil, fmt.Errorf("unexpected error"))

		client := client{config: Config{Session: SessionConfig{Token: "1234"}}, dbClient: dbClient}
		nxt := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		})
		handler := client.MiddlewareHandler(nxt)

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/", nil)

		token, err := jwt.CreateToken(&Token{SessionID: sessionID}, client.config.Session.Token, time.Hour)
		require.NoError(t, err)

		req.AddCookie(
			&http.Cookie{
				Name:     "kobs.token",
				Value:    token,
				Path:     "/",
				Secure:   true,
				HttpOnly: true,
				Expires:  time.Now().Add(time.Hour),
			},
		)

		w := httptest.NewRecorder()
		handler.ServeHTTP(w, req)
		utils.AssertStatusEq(t, w, http.StatusUnauthorized)
	})
}

func TestMount(t *testing.T) {
	c := client{
		router: chi.NewRouter(),
	}

	require.NotNil(t, c.Mount())
}

func TestAuthHandler(t *testing.T) {
	t.Run("should fail when no token is set", func(t *testing.T) {
		client := client{}

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/", nil)
		w := httptest.NewRecorder()

		client.authHandler(w, req)
		utils.AssertStatusEq(t, w, http.StatusUnauthorized)
	})

	t.Run("should fail when token is invalid", func(t *testing.T) {
		client := client{config: Config{Session: SessionConfig{Token: "1234"}}}

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/", nil)

		token, err := jwt.CreateToken(&Token{SessionID: primitive.NewObjectID()}, client.config.Session.Token+"to make signature invalid", time.Hour)
		require.NoError(t, err)

		req.AddCookie(
			&http.Cookie{
				Name:     "kobs.token",
				Value:    token,
				Path:     "/",
				Secure:   true,
				HttpOnly: true,
				Expires:  time.Now().Add(time.Hour),
			},
		)

		w := httptest.NewRecorder()
		client.authHandler(w, req)
		utils.AssertStatusEq(t, w, http.StatusUnauthorized)
	})

	t.Run("should fail when session is not found", func(t *testing.T) {
		sessionID := primitive.NewObjectID()

		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetAndUpdateSession(gomock.Any(), sessionID).Return(nil, db.ErrSessionNotFound)

		client := client{config: Config{Session: SessionConfig{Token: "1234"}}, dbClient: dbClient}

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/", nil)

		token, err := jwt.CreateToken(&Token{SessionID: sessionID}, client.config.Session.Token, time.Hour)
		require.NoError(t, err)

		req.AddCookie(
			&http.Cookie{
				Name:     "kobs.token",
				Value:    token,
				Path:     "/",
				Secure:   true,
				HttpOnly: true,
				Expires:  time.Now().Add(time.Hour),
			},
		)

		w := httptest.NewRecorder()
		client.authHandler(w, req)
		utils.AssertStatusEq(t, w, http.StatusUnauthorized)
	})

	t.Run("should fail when database returns an error", func(t *testing.T) {
		sessionID := primitive.NewObjectID()

		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetAndUpdateSession(gomock.Any(), sessionID).Return(nil, fmt.Errorf("unexpected error"))

		client := client{config: Config{Session: SessionConfig{Token: "1234"}}, dbClient: dbClient}

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/", nil)

		token, err := jwt.CreateToken(&Token{SessionID: sessionID}, client.config.Session.Token, time.Hour)
		require.NoError(t, err)

		req.AddCookie(
			&http.Cookie{
				Name:     "kobs.token",
				Value:    token,
				Path:     "/",
				Secure:   true,
				HttpOnly: true,
				Expires:  time.Now().Add(time.Hour),
			},
		)

		w := httptest.NewRecorder()
		client.authHandler(w, req)
		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
	})

	t.Run("should fail when user could not be get from database", func(t *testing.T) {
		sessionID := primitive.NewObjectID()
		session := &db.Session{
			ID: sessionID,
			User: authContext.User{
				ID: "test@kobs.io",
			},
		}

		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetAndUpdateSession(gomock.Any(), sessionID).Return(session, nil)
		dbClient.EXPECT().GetUserByID(gomock.Any(), session.User.ID).Return(nil, fmt.Errorf("unexpected error"))

		client := client{config: Config{Session: SessionConfig{Token: "1234"}}, dbClient: dbClient}

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/", nil)

		token, err := jwt.CreateToken(&Token{SessionID: sessionID}, client.config.Session.Token, time.Hour)
		require.NoError(t, err)

		req.AddCookie(
			&http.Cookie{
				Name:     "kobs.token",
				Value:    token,
				Path:     "/",
				Secure:   true,
				HttpOnly: true,
				Expires:  time.Now().Add(time.Hour),
			},
		)

		w := httptest.NewRecorder()
		client.authHandler(w, req)
		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
	})

	t.Run("should return user", func(t *testing.T) {
		sessionID := primitive.NewObjectID()
		session := &db.Session{
			ID: sessionID,
			User: authContext.User{
				ID: "test@kobs.io",
			},
		}

		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetAndUpdateSession(gomock.Any(), sessionID).Return(session, nil)
		dbClient.EXPECT().GetUserByID(gomock.Any(), session.User.ID).Return(nil, nil)

		client := client{config: Config{Session: SessionConfig{Token: "1234"}}, dbClient: dbClient}

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/", nil)

		token, err := jwt.CreateToken(&Token{SessionID: sessionID}, client.config.Session.Token, time.Hour)
		require.NoError(t, err)

		req.AddCookie(
			&http.Cookie{
				Name:     "kobs.token",
				Value:    token,
				Path:     "/",
				Secure:   true,
				HttpOnly: true,
				Expires:  time.Now().Add(time.Hour),
			},
		)

		w := httptest.NewRecorder()
		client.authHandler(w, req)
		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"id":"test@kobs.io", "name":"", "permissions":{}, "teams": null}`)
	})
}

func TestSigninHandler(t *testing.T) {
	t.Run("should fail for invalid request body", func(t *testing.T) {
		client := client{}

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/signin", strings.NewReader(`{"username":1234,"password":"admin"}`))
		w := httptest.NewRecorder()

		client.signinHandler(w, req)
		utils.AssertStatusEq(t, w, http.StatusBadRequest)
	})

	t.Run("should fail on database error", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetUserByID(gomock.Any(), "admin").Return(nil, fmt.Errorf("unexpected error"))

		client := client{config: Config{Session: SessionConfig{Token: "1234"}}, dbClient: dbClient}

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/signin", strings.NewReader(`{"username":"admin","password":"admin"}`))
		w := httptest.NewRecorder()

		client.signinHandler(w, req)
		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
	})

	t.Run("should fail when user is not found", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetUserByID(gomock.Any(), "admin").Return(nil, nil)

		client := client{config: Config{Session: SessionConfig{Token: "1234"}}, dbClient: dbClient}

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/signin", strings.NewReader(`{"username":"admin","password":"admin"}`))
		w := httptest.NewRecorder()

		client.signinHandler(w, req)
		utils.AssertStatusEq(t, w, http.StatusBadRequest)
	})

	t.Run("should fail when wrong password is provided", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetUserByID(gomock.Any(), "admin").Return(&userv1.UserSpec{ID: "admin", Password: "$2y$10$o2AokncpHCowCvDJ2rOp.e18ThDg0mlaLj5QMsjtwEEBtrEn7IYRS"}, nil)

		client := client{config: Config{Session: SessionConfig{Token: "1234"}}, dbClient: dbClient}

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/signin", strings.NewReader(`{"username":"admin","password":"wrongpassword"}`))
		w := httptest.NewRecorder()

		client.signinHandler(w, req)
		utils.AssertStatusEq(t, w, http.StatusBadRequest)
	})

	t.Run("should fail on database error while getting teams", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetUserByID(gomock.Any(), "admin").Return(&userv1.UserSpec{ID: "admin", Password: "$2y$10$o2AokncpHCowCvDJ2rOp.e18ThDg0mlaLj5QMsjtwEEBtrEn7IYRS", Teams: []string{"team"}}, nil)
		dbClient.EXPECT().GetTeamsByIDs(gomock.Any(), []string{"team"}).Return(nil, fmt.Errorf("unexpected error"))

		client := client{config: Config{Session: SessionConfig{Token: "1234"}}, dbClient: dbClient}

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/signin", strings.NewReader(`{"username":"admin","password":"admin"}`))
		w := httptest.NewRecorder()

		client.signinHandler(w, req)
		utils.AssertStatusEq(t, w, http.StatusBadRequest)
	})

	t.Run("should fail on database error while creating session", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetUserByID(gomock.Any(), "admin").Return(&userv1.UserSpec{ID: "admin", Password: "$2y$10$o2AokncpHCowCvDJ2rOp.e18ThDg0mlaLj5QMsjtwEEBtrEn7IYRS", Teams: []string{"team"}}, nil)
		dbClient.EXPECT().GetTeamsByIDs(gomock.Any(), []string{"team"}).Return([]teamv1.TeamSpec{{ID: "team"}}, nil)
		dbClient.EXPECT().CreateSession(gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		client := client{config: Config{Session: SessionConfig{Token: "1234"}}, dbClient: dbClient}

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/signin", strings.NewReader(`{"username":"admin","password":"admin"}`))
		w := httptest.NewRecorder()

		client.signinHandler(w, req)
		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
	})

	t.Run("should return user", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetUserByID(gomock.Any(), "admin").Return(&userv1.UserSpec{ID: "admin", Password: "$2y$10$o2AokncpHCowCvDJ2rOp.e18ThDg0mlaLj5QMsjtwEEBtrEn7IYRS", Teams: []string{"team"}}, nil)
		dbClient.EXPECT().GetTeamsByIDs(gomock.Any(), []string{"team"}).Return([]teamv1.TeamSpec{{ID: "team"}}, nil)
		dbClient.EXPECT().CreateSession(gomock.Any(), gomock.Any()).Return(&db.Session{ID: primitive.NewObjectID()}, nil)

		client := client{config: Config{Session: SessionConfig{Token: "1234"}}, dbClient: dbClient}

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/signin", strings.NewReader(`{"username":"admin","password":"admin"}`))
		w := httptest.NewRecorder()

		client.signinHandler(w, req)
		utils.AssertStatusEq(t, w, http.StatusOK)
	})
}

func TestSignoutHandler(t *testing.T) {
	t.Run("should fail when no token is set", func(t *testing.T) {
		client := client{}

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/signout", nil)
		w := httptest.NewRecorder()

		client.signoutHandler(w, req)
		utils.AssertStatusEq(t, w, http.StatusBadRequest)
	})

	t.Run("should fail when token is invalid", func(t *testing.T) {
		client := client{config: Config{Session: SessionConfig{Token: "1234"}}}

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/signout", nil)

		token, err := jwt.CreateToken(&Token{SessionID: primitive.NewObjectID()}, client.config.Session.Token+"to make signature invalid", time.Hour)
		require.NoError(t, err)

		req.AddCookie(
			&http.Cookie{
				Name:     "kobs.token",
				Value:    token,
				Path:     "/",
				Secure:   true,
				HttpOnly: true,
				Expires:  time.Now().Add(time.Hour),
			},
		)

		w := httptest.NewRecorder()
		client.signoutHandler(w, req)
		utils.AssertStatusEq(t, w, http.StatusBadRequest)
	})

	t.Run("should fail when session is not deleted", func(t *testing.T) {
		sessionID := primitive.NewObjectID()

		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().DeleteSession(gomock.Any(), sessionID).Return(fmt.Errorf("unexpected error"))

		client := client{config: Config{Session: SessionConfig{Token: "1234"}}, dbClient: dbClient}

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/signout", nil)

		token, err := jwt.CreateToken(&Token{SessionID: sessionID}, client.config.Session.Token, time.Hour)
		require.NoError(t, err)

		req.AddCookie(
			&http.Cookie{
				Name:     "kobs.token",
				Value:    token,
				Path:     "/",
				Secure:   true,
				HttpOnly: true,
				Expires:  time.Now().Add(time.Hour),
			},
		)

		w := httptest.NewRecorder()
		client.signoutHandler(w, req)
		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
	})

	t.Run("should sign out", func(t *testing.T) {
		sessionID := primitive.NewObjectID()

		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().DeleteSession(gomock.Any(), sessionID).Return(nil)

		client := client{config: Config{Session: SessionConfig{Token: "1234"}}, dbClient: dbClient}

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/signout", nil)

		token, err := jwt.CreateToken(&Token{SessionID: sessionID}, client.config.Session.Token, time.Hour)
		require.NoError(t, err)

		req.AddCookie(
			&http.Cookie{
				Name:     "kobs.token",
				Value:    token,
				Path:     "/",
				Secure:   true,
				HttpOnly: true,
				Expires:  time.Now().Add(time.Hour),
			},
		)

		w := httptest.NewRecorder()
		client.signoutHandler(w, req)
		utils.AssertStatusEq(t, w, http.StatusNoContent)
	})
}

func TestOidcHandler(t *testing.T) {
	t.Run("should return error when oidc is not configured", func(t *testing.T) {
		c := client{
			router: chi.NewRouter(),
		}

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/", nil)
		w := httptest.NewRecorder()
		c.oidcHandler(w, req)
		require.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("should return oidc provider url", func(t *testing.T) {
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
	t.Run("shoudl return new client", func(t *testing.T) {
		client, err := NewClient(Config{}, settings.Settings{}, nil)
		require.NotNil(t, client)
		require.NoError(t, err)
	})

	t.Run("should return new client with oidc", func(t *testing.T) {
		client, err := NewClient(Config{OIDC: OIDCConfig{Enabled: true, Issuer: "https://accounts.google.com", Scopes: []string{"openid", "profile", "email"}}, Session: SessionConfig{Duration: Duration{5 * time.Hour}}}, settings.Settings{}, nil)
		require.NotNil(t, client)
		require.NoError(t, err)
	})

	t.Run("shoudl return error when client can not be created", func(t *testing.T) {
		client, err := NewClient(Config{OIDC: OIDCConfig{Enabled: true, Issuer: "https://kobs.io"}}, settings.Settings{}, nil)
		require.Nil(t, client)
		require.Error(t, err)
	})
}
