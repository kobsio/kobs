package auth

import (
	"fmt"
	"net/http"
	"time"

	"github.com/kobsio/kobs/pkg/hub/auth/jwt"
	"github.com/kobsio/kobs/pkg/hub/auth/refreshtoken"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"
	"go.uber.org/zap"
	"golang.org/x/oauth2"
)

// handleTokenRefresh tries to refresh the accesstoken
// when there is no refresh token -> check if user still exists in config and re-create the access-token
// when there is a refresh token  -> use refresh token or check the config if user is still present
func (c *client) refreshTokenHandler(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("kobs.refreshtoken")
	if err != nil {
		log.Warn(r.Context(), "unexpected error when fetching cookie for refreshtoken", zap.Error(err))
		errresponse.Render(w, r, http.StatusUnauthorized, fmt.Errorf("unauthorized"))
		return
	}

	refreshToken, err := refreshtoken.FromString(cookie.Value)
	if err != nil {
		log.Error(r.Context(), "unable to parse refreshToken", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, fmt.Errorf("unable to parse refreshtoken"))
		return
	}

	var newRefreshToken string
	var teams []string
	if refreshToken.Type == refreshtoken.Credentials {
		userConf := c.getUserFromConfig(refreshToken.UserID)
		oldPasswordHash := refreshToken.Value
		newPasswordHash := userConf.getHash()

		if oldPasswordHash != newPasswordHash {
			errresponse.Render(w, r, http.StatusUnauthorized, fmt.Errorf("password has changed, please sign in again"))
			return
		}

		newRefreshToken = cookie.Value
		teams = userConf.Groups
	}

	if refreshToken.Type == refreshtoken.OIDC {
		tokenSource := c.oidcConfig.TokenSource(r.Context(), &oauth2.Token{RefreshToken: refreshToken.Value})
		newToken, err := tokenSource.Token()
		if err != nil {
			log.Error(r.Context(), "unable to fetch new token from oidc provider", zap.Error(err))
			errresponse.Render(w, r, http.StatusInternalServerError, fmt.Errorf("unable to fetch new token from oidc provider"))
			return
		}

		newRefreshToken, err = refreshtoken.Token{
			Type:  refreshtoken.OIDC,
			Value: newToken.RefreshToken,
		}.Encode()
		if err != nil {
			log.Error(r.Context(), "unexpected error when encoding refreshtoken", zap.Error(err))
			errresponse.Render(w, r, http.StatusInternalServerError, fmt.Errorf("unexpected error when encoding refreshtoken"))
			return
		}

		// TODO: reload the groups here, but how?
	}

	if newRefreshToken == "" {
		log.Error(r.Context(), "new refreshtoken is unexpectedly empty")
		errresponse.Render(w, r, http.StatusInternalServerError, fmt.Errorf("new refreshtoken is empty"))
		return
	}

	accessToken, err := jwt.CreateToken(&session{Email: refreshToken.UserID, Teams: teams}, c.config.Session.Token, c.config.Session.ParsedInterval)
	if err != nil {
		log.Warn(r.Context(), "Could not create jwt token", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, fmt.Errorf("could not create jwt token"))
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "kobs.accesstoken",
		Value:    accessToken,
		Path:     "/",
		Secure:   true,
		HttpOnly: true,
		Expires:  time.Now().Add(c.config.Session.ParsedInterval),
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "kobs.refreshtoken",
		Value:    newRefreshToken,
		Path:     "/",
		Secure:   true,
		HttpOnly: true,
		Expires:  time.Now().Add(365 * 24 * time.Hour),
	})
}
