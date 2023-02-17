package auth

import (
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/go-chi/render"
	"github.com/kobsio/kobs/pkg/hub/auth/jwt"
	"github.com/kobsio/kobs/pkg/hub/auth/refreshtoken"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"
	"go.uber.org/zap"
	"golang.org/x/oauth2"
)

// oidcHandler returns the login for the OIDC provider, which can then be used by the user to authenticate via
// the configured provider. If no OIDC provider is configured this will return an error.
// the result of this handler includes the redirect url, which helps us to direct the user to the desired uri after the sign-in is completed
func (c *client) oidcHandler(w http.ResponseWriter, r *http.Request) {
	if c.oidcConfig == nil || c.oidcProvider == nil {
		log.Warn(r.Context(), "OIDC provider is not configured")
		errresponse.Render(w, r, http.StatusBadRequest, "OIDC provider is not configured")
		return
	}

	redirect := r.URL.Query().Get("redirect")
	data := struct {
		URL string `json:"url"`
	}{
		c.oidcConfig.AuthCodeURL(c.config.OIDC.State + url.QueryEscape(redirect)),
	}

	render.JSON(w, r, data)
}

type Session struct {
	Email string   `json:"email"`
	Teams []string `json:"teams"`
}

func (c *client) oidcCallbackHandler(w http.ResponseWriter, r *http.Request) {
	if c.oidcConfig == nil || c.oidcProvider == nil {
		log.Warn(r.Context(), "OIDC provider is not configured")
		errresponse.Render(w, r, http.StatusBadRequest, "OIDC provider is not configured")
		return
	}

	state := r.URL.Query().Get("state")

	if !strings.HasPrefix(state, c.config.OIDC.State) {
		log.Warn(r.Context(), "Invalid state", zap.String("state", state))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid 'state' parameter")
		return
	}

	verifier := c.oidcProvider.Verifier(&oidc.Config{ClientID: c.config.OIDC.ClientID})

	oauth2Token, err := c.oidcConfig.Exchange(r.Context(), r.URL.Query().Get("code"), oauth2.AccessTypeOffline)
	if err != nil {
		log.Warn(r.Context(), "Failed to exchange authorization code for refresh token", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to exchange authorization code for refresh token")
		return
	}

	rawIDToken, ok := oauth2Token.Extra("id_token").(string)
	if !ok {
		log.Warn(r.Context(), "Failed to get id token")
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to get id token")
		return
	}

	idToken, err := verifier.Verify(r.Context(), rawIDToken)
	if err != nil {
		log.Warn(r.Context(), "ID token verification failed", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "ID token verification failed")
		return
	}

	var claims struct {
		Email   string   `json:"email"`
		Picture string   `json:"picture"`
		Groups  []string `json:"groups"`
	}
	if err := idToken.Claims(&claims); err != nil {
		log.Warn(r.Context(), "Failed to get claims", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to get claims")
		return
	}

	accessToken, err := jwt.CreateToken(&Session{Email: claims.Email, Teams: claims.Groups}, c.config.Session.Token, c.config.Session.ParsedInterval)
	if err != nil {
		log.Warn(r.Context(), "Failed to create jwt token", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to create jwt token")
		return
	}

	refreshToken, err := refreshtoken.Token{
		Type:   refreshtoken.OIDC,
		Value:  oauth2Token.RefreshToken,
		UserID: claims.Email,
	}.Encode()
	if err != nil {
		log.Error(r.Context(), "Failed to parse refresh token", zap.Error(err))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to parse refresh token")
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
		Value:    refreshToken,
		Path:     "/",
		Secure:   true,
		HttpOnly: true,
		Expires:  time.Now().Add(365 * 24 * time.Hour),
	})

	data := struct {
		URL string `json:"url"`
	}{
		strings.TrimPrefix(state, c.config.OIDC.State),
	}

	render.JSON(w, r, data)
}
