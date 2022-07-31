package auth

import (
	"time"
)

type Config struct {
	Enabled bool          `json:"enabled"`
	OIDC    OIDCConfig    `json:"oidc"`
	Session SessionConfig `json:"session"`
	Users   []UserConfig  `json:"users"`
}

type OIDCConfig struct {
	Enabled      bool     `json:"enabled"`
	Issuer       string   `json:"issuer"`
	ClientID     string   `json:"clientID"`
	ClientSecret string   `json:"clientSecret"`
	RedirectURL  string   `json:"redirectURL"`
	State        string   `json:"state"`
	Scopes       []string `json:"scopes"`
}

type SessionConfig struct {
	Token          string        `json:"token"`
	Interval       string        `json:"interval"`
	ParsedInterval time.Duration `json:"-"`
}

type UserConfig struct {
	Email    string   `json:"email"`
	Password string   `json:"password"`
	Groups   []string `json:"groups"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
