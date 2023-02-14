package auth

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang/mock/gomock"
	teamv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/auth/jwt"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/stretchr/testify/require"
)

func TestAuthMiddleware(t *testing.T) {
	t.Run("passes when user is set in request context", func(t *testing.T) {
		client := client{config: Config{}}
		nxt := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// http.StatusAccepted is used instead of http.StatusOK, to verify that this handler is actually called
			// http.StatusOK is the default status code
			w.WriteHeader(http.StatusAccepted)
		})
		handler := client.MiddlewareHandler(nxt)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/", nil)
		w := httptest.NewRecorder()

		handler.ServeHTTP(w, req)
		utils.AssertStatusEq(t, http.StatusAccepted, w)
	})

	t.Run("fetches user from db when cookie is valid", func(t *testing.T) {
		user := &userv1.UserSpec{
			ID:          "test@kobs.io",
			Permissions: userv1.Permissions{Teams: []string{"team@kobs.io"}},
		}
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetUserByID(gomock.Any(), user.ID).Return(user, nil)
		dbClient.EXPECT().GetTeamsByIDs(gomock.Any(), user.Permissions.Teams).Return([]teamv1.TeamSpec{{
			ID:          user.Permissions.Teams[0],
			Permissions: userv1.Permissions{},
		}}, nil)

		client := client{config: Config{Enabled: true, Session: SessionConfig{Token: "1234"}}, dbClient: dbClient}
		nxt := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// verify that the user is set in the request context and that it matches with what is expected:
			userFromCtx, userIsSet := r.Context().Value(authContext.UserKey).(authContext.User)
			require.True(t, userIsSet)
			require.Equal(t, authContext.User{
				ID:          user.ID,
				Teams:       user.Permissions.Teams,
				Permissions: user.Permissions,
			}, userFromCtx)
			w.WriteHeader(http.StatusAccepted)
		})
		handler := client.MiddlewareHandler(nxt)

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/", nil)

		accessToken, err := jwt.CreateToken(&session{Email: user.ID, Teams: user.Permissions.Teams}, client.config.Session.Token, time.Hour)
		require.NoError(t, err)
		req.AddCookie(
			&http.Cookie{
				Name:     "kobs.accesstoken",
				Value:    accessToken,
				Path:     "/",
				Secure:   true,
				HttpOnly: true,
				Expires:  time.Now().Add(time.Hour),
			},
		)

		w := httptest.NewRecorder()
		handler.ServeHTTP(w, req)
		utils.AssertStatusEq(t, http.StatusAccepted, w)
	})

	t.Run("fails when cookie isn't set", func(t *testing.T) {
		client := client{config: Config{Enabled: true, Session: SessionConfig{Token: "1234"}}}
		nxt := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusAccepted)
		})
		handler := client.MiddlewareHandler(nxt)

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/", nil)

		w := httptest.NewRecorder()
		handler.ServeHTTP(w, req)
		utils.AssertStatusEq(t, http.StatusUnauthorized, w)
	})

	t.Run("fails when cookie value is invalid", func(t *testing.T) {
		client := client{config: Config{Enabled: true, Session: SessionConfig{Token: "1234"}}}
		nxt := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		})
		handler := client.MiddlewareHandler(nxt)

		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/", nil)
		accessToken, err := jwt.CreateToken(&session{Email: "test@kobs.io"}, client.config.Session.Token+"to make signature invalid", time.Hour)
		require.NoError(t, err)
		req.AddCookie(
			&http.Cookie{
				Name:     "kobs.accesstoken",
				Value:    accessToken,
				Path:     "/",
				Secure:   true,
				HttpOnly: true,
				Expires:  time.Now().Add(time.Hour),
			},
		)

		w := httptest.NewRecorder()
		handler.ServeHTTP(w, req)
		utils.AssertStatusEq(t, http.StatusUnauthorized, w)
	})
}
