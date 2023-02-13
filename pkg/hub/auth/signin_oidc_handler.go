package auth

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/go-chi/render"
	"github.com/kobsio/kobs/pkg/hub/auth/jwt"
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
		errresponse.Render(w, r, http.StatusBadRequest, fmt.Errorf("oIDC provider is not configured"))
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
		errresponse.Render(w, r, http.StatusBadRequest, fmt.Errorf("oidc provider is not configured"))
		return
	}

	state := r.URL.Query().Get("state")

	if !strings.HasPrefix(state, c.config.OIDC.State) {
		log.Warn(r.Context(), "Invalid state", zap.String("state", state))
		errresponse.Render(w, r, http.StatusBadRequest, fmt.Errorf("invalid state"))
		return
	}

	verifier := c.oidcProvider.Verifier(&oidc.Config{ClientID: c.config.OIDC.ClientID})

	oauth2Token, err := c.oidcConfig.Exchange(r.Context(), r.URL.Query().Get("code"), oauth2.AccessTypeOffline)
	if err != nil {
		log.Warn(r.Context(), "Could not exchange authorization code into token", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, fmt.Errorf("could not exchange authorization code into token"))
		return
	}

	rawIDToken, ok := oauth2Token.Extra("id_token").(string)
	if !ok {
		log.Warn(r.Context(), "Could not get raw id token")
		errresponse.Render(w, r, http.StatusBadRequest, fmt.Errorf("could not get raw id token"))
		return
	}

	idToken, err := verifier.Verify(r.Context(), rawIDToken)
	if err != nil {
		log.Warn(r.Context(), "Could not verify raw id token", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, fmt.Errorf("could not verify raw id token"))
		return
	}

	var claims struct {
		Email   string   `json:"email"`
		Picture string   `json:"picture"`
		Groups  []string `json:"groups"`
	}
	if err := idToken.Claims(&claims); err != nil {
		log.Warn(r.Context(), "Could not get claims", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, fmt.Errorf("could not get claims"))
		return
	}

	token, err := jwt.CreateToken(&Session{Email: claims.Email, Teams: claims.Groups}, c.config.Session.Token, c.config.Session.ParsedInterval)
	if err != nil {
		log.Warn(r.Context(), "Could not create jwt token", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, fmt.Errorf("could not create jwt token"))
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "kobs.accesstoken",
		Value:    token,
		Path:     "/",
		Secure:   true,
		HttpOnly: true,
		Expires:  time.Now().Add(c.config.Session.ParsedInterval),
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "kobs.refreshtoken",
		Value:    oauth2Token.RefreshToken,
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
