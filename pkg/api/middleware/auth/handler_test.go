package auth

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kobsio/kobs/pkg/api/clusters"
	authContext "github.com/kobsio/kobs/pkg/api/middleware/auth/context"

	"github.com/stretchr/testify/require"
)

func TestHandler(t *testing.T) {
	require.NotEmpty(t, Handler(&clusters.MockClient{}))
}

func TestUserHandler(t *testing.T) {
	for _, tt := range []struct {
		name               string
		user               interface{}
		expectedStatusCode int
		expectedBody       string
	}{
		{
			name:               "get user",
			user:               authContext.User{},
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"cluster\":\"\",\"namespace\":\"\",\"name\":\"\",\"id\":\"\",\"profile\":{\"fullName\":\"\",\"email\":\"\"},\"teams\":null,\"permissions\":{\"plugins\":null,\"resources\":null}}\n",
		},
		{
			name:               "could not get user",
			user:               nil,
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to access the resource: Unauthorized\"}\n",
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			req, _ := http.NewRequest(http.MethodGet, "/user", nil)
			req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, tt.user))

			w := httptest.NewRecorder()
			UserHandler(w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}
