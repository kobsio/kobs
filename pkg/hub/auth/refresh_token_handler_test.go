package auth

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/kobsio/kobs/pkg/hub/auth/refreshtoken"
	"github.com/kobsio/kobs/pkg/utils"
	"github.com/stretchr/testify/require"
)

func TestRefreshTokenHandler(t *testing.T) {
	addRefreshToken := func(t *testing.T, req *http.Request, token refreshtoken.Token) {
		encoded, err := token.Encode()
		require.NoError(t, err)
		req.AddCookie(
			&http.Cookie{
				Name:     "kobs.refreshtoken",
				Value:    encoded,
				Path:     "/",
				Secure:   true,
				HttpOnly: true,
				Expires:  time.Now().Add(time.Hour),
			},
		)
	}

	t.Run("refreshes the token when the refresh token is of type 'Credentials'", func(t *testing.T) {
		userConf := userConfig{
			Email:    "test@kobs.io",
			Password: "$2a$12$YJe7nJUBeI6ETwJ.JzwK3.2PgkJCchgdHO73zwSUDeTBzalzqTRXe", // "1234"
		}
		client := client{config: Config{
			Enabled: true,
			Users:   []userConfig{userConf},
		}}
		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/refresh", nil)
		addRefreshToken(t, req, refreshtoken.Token{
			Type:   refreshtoken.Credentials,
			Value:  userConf.getHash(),
			UserID: userConf.Email,
		})
		w := httptest.NewRecorder()

		client.refreshTokenHandler(w, req)
		utils.AssertStatusEq(t, http.StatusOK, w)
		require.Len(t, w.Result().Cookies(), 2)

		foundAccessToken := false
		for _, c := range w.Result().Cookies() {
			if c.Name == "kobs.accesstoken" {
				foundAccessToken = true
			}
		}
		require.True(t, foundAccessToken)
	})

	t.Run("unauthorized when password changed", func(t *testing.T) {
		userConf := userConfig{
			Email:    "test@kobs.io",
			Password: "$2a$12$YJe7nJUBeI6ETwJ.JzwK3.2PgkJCchgdHO73zwSUDeTBzalzqTRXe", // "1234"
		}

		client := client{config: Config{
			Enabled: true,
			Users:   []userConfig{userConf},
		}}
		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodPost, "/refresh", nil)

		oldUserConf := userConfig{
			Email:    "test@kobs.io",
			Password: "$2a$12$3NcV8D3NBcwIv2mi2h.dK.NJ1YOaiY8Rs31UvxrLmA6IuV20XEGze",
		}
		addRefreshToken(t, req, refreshtoken.Token{
			Type:   refreshtoken.Credentials,
			Value:  oldUserConf.getHash(),
			UserID: userConf.Email,
		})
		w := httptest.NewRecorder()

		client.refreshTokenHandler(w, req)
		utils.AssertStatusEq(t, http.StatusUnauthorized, w)
	})
}
