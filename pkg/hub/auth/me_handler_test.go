package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang/mock/gomock"
	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"
	"github.com/kobsio/kobs/pkg/hub/auth/jwt"
	"github.com/kobsio/kobs/pkg/hub/auth/refreshtoken"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/utils"
	"github.com/stretchr/testify/require"
)

func TestMeHandler(t *testing.T) {
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

	t.Run("when request has no refreshtoken and no accesstoken", func(t *testing.T) {
		client := client{}
		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/me", nil)
		w := httptest.NewRecorder()

		client.meHandler(w, req)
		utils.AssertStatusEq(t, http.StatusUnauthorized, w)
	})

	t.Run("when request has accesstoken", func(t *testing.T) {
		user := "test@kobs.io"
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetUserByID(gomock.Any(), user).Return(&userv1.UserSpec{
			ID: user,
		}, nil)
		client := client{
			dbClient: dbClient,
			config: Config{
				Session: SessionConfig{
					Token:          "1234",
					ParsedInterval: time.Hour,
				},
			},
		}
		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/me", nil)
		accessToken, err := jwt.CreateToken(&session{Email: user}, client.config.Session.Token, client.config.Session.ParsedInterval)
		require.NoError(t, err)
		req.AddCookie(
			&http.Cookie{
				Name:     "kobs.accesstoken",
				Value:    accessToken,
				Path:     "/",
				Secure:   true,
				HttpOnly: true,
				Expires:  time.Now().Add(client.config.Session.ParsedInterval),
			},
		)
		w := httptest.NewRecorder()

		client.meHandler(w, req)
		utils.AssertStatusEq(t, http.StatusOK, w)
		utils.AssertJSONEq(t, fmt.Sprintf(`
			{
				"accessToken": "%s",
				"user": {
					"email": "test@kobs.io",
					"permissions": {},
					"teams": null
				}
			}`, accessToken),
			w)
	})

	t.Run("when request has no accesstoken, but a refreshtoken", func(t *testing.T) {
		userConf := userConfig{
			Email:    "test@kobs.io",
			Password: "$2a$12$YJe7nJUBeI6ETwJ.JzwK3.2PgkJCchgdHO73zwSUDeTBzalzqTRXe", // "1234"
		}
		ctrl := gomock.NewController(t)
		dbClient := db.NewMockClient(ctrl)
		dbClient.EXPECT().GetUserByID(gomock.Any(), userConf.Email).Return(&userv1.UserSpec{
			ID: userConf.Email,
		}, nil)
		client := client{
			dbClient: dbClient,
			config: Config{
				Session: SessionConfig{
					Token:          "1234",
					ParsedInterval: time.Hour,
				},
				Users: []userConfig{userConf},
			},
		}
		ctx := context.Background()
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/me", nil)
		addRefreshToken(t, req, refreshtoken.Token{
			Type:   refreshtoken.Credentials,
			Value:  userConf.getHash(),
			UserID: userConf.Email,
		})
		w := httptest.NewRecorder()

		client.meHandler(w, req)
		utils.AssertStatusEq(t, http.StatusOK, w)
		var result struct {
			AccessToken string `json:"accessToken"`
		}
		require.NoError(t, json.NewDecoder(w.Body).Decode(&result))
		require.NotEmpty(t, &result.AccessToken)
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

		client.meHandler(w, req)
		utils.AssertStatusEq(t, http.StatusUnauthorized, w)
	})
}
