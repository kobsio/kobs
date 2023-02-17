package auth

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/go-chi/chi/v5"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/utils"
	"github.com/stretchr/testify/require"
)

func TestSigninHandler(t *testing.T) {
	userEmail := "test@test.test"
	userPassword := "supersecret"
	userPasswordCrypted := "$2a$12$SLXSAlYhJsVXxIUiheQgX.oWH3xkID1IWkQ4NELMkAeh6MzbSPWBu"
	client := client{config: Config{
		Users: []userConfig{
			{Email: userEmail, Password: userPasswordCrypted},
		},
	}}

	t.Run("can signin with valid credentials", func(t *testing.T) {
		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/signin", strings.NewReader(fmt.Sprintf(`{"email": "%s", "password": "%s"}`, userEmail, userPassword)))
		w := httptest.NewRecorder()

		client.signinHandler(w, req)
		utils.AssertStatusEq(t, w, http.StatusNoContent)

		// sets cookie
		require.NotEmpty(t, w.Result().Cookies())
		cookie := w.Result().Cookies()[0]
		require.Equal(t, cookie.Name, "kobs.accesstoken")
	})

	t.Run("rejects users that are not part of the config", func(t *testing.T) {
		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/signin", strings.NewReader(fmt.Sprintf(`{"email": "notinconfig@test.test", "password": "%s"}`, userPassword)))
		w := httptest.NewRecorder()

		client.signinHandler(w, req)
		utils.AssertStatusEq(t, w, http.StatusBadRequest)
	})

	t.Run("rejects invalid passwords", func(t *testing.T) {
		ctx := context.Background()
		ctx = context.WithValue(ctx, chi.RouteCtxKey, chi.NewRouteContext())
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{})
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/signin", strings.NewReader(fmt.Sprintf(`{"email": "%s", "password": "%s"}`, userEmail, "not valid")))
		w := httptest.NewRecorder()

		client.signinHandler(w, req)
		utils.AssertStatusEq(t, w, http.StatusBadRequest)
	})
}
