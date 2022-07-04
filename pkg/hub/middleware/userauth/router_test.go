package userauth

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
	"github.com/stretchr/testify/require"
)

func TestUserAuthHandler(t *testing.T) {
	for _, tt := range []struct {
		name               string
		user               any
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name:               "get user",
			user:               authContext.User{},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"email\":\"\",\"teams\":null,\"permissions\":{}}\n",
		},
		{
			name:               "could not get user",
			user:               nil,
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to access the resource: Unauthorized\"}\n",
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			router := Router{chi.NewRouter(), ""}

			req, _ := http.NewRequest(http.MethodGet, "/user", nil)
			req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, tt.user))

			w := httptest.NewRecorder()
			router.userAuthHandler(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestUserLogoutHandler(t *testing.T) {
	router := Router{chi.NewRouter(), ""}

	req, _ := http.NewRequest(http.MethodGet, "/user", nil)

	w := httptest.NewRecorder()
	router.userLogoutHandler(w, req)

	require.Equal(t, http.StatusSeeOther, w.Code)
}

func TestMount(t *testing.T) {
	router := Mount("")
	require.NotNil(t, router)
}
