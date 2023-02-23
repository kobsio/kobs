package auth

import (
	"encoding/json"
	"time"

	dashboardv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/dashboard/v1"
	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Duration is our custom type for the session duration in the auth configuration. This is required so that we can
// configure the duration via the kong command line config and via json file.
type Duration struct {
	time.Duration
}

// UnmarshalJSON unmarshals the provided bytes into our custom Duration type. This function is called by kong and the
// json file logic, so that we have to ignore the json unmarshal failure (in case it is called by kong) and try to
// directly parse the provided bytes into the duration.
func (d *Duration) UnmarshalJSON(b []byte) error {
	var v string
	if err := json.Unmarshal(b, &v); err != nil {
		d.Duration, err = time.ParseDuration(string(b))
		if err != nil {
			return err
		}
		return nil
	}

	var err error
	d.Duration, err = time.ParseDuration(v)
	if err != nil {
		return err
	}
	return nil
}

type Config struct {
	OIDC    OIDCConfig    `json:"oidc" embed:"" prefix:"oidc." envprefix:"OIDC_"`
	Session SessionConfig `json:"session" embed:"" prefix:"session." envprefix:"SESSION_"`
}

type OIDCConfig struct {
	Enabled      bool     `json:"enabled" env:"ENABLED" help:"Enables the OIDC provider, so that uses can sign in via OIDC."`
	Issuer       string   `json:"issuer" env:"ISSUER" help:"The issuer url for the OIDC provider."`
	ClientID     string   `json:"clientID" env:"CLIENT_ID" help:"The client id for the OIDC provider."`
	ClientSecret string   `json:"clientSecret" env:"CLIENT_SECRET" help:"The client secret for the OIDC provider."`
	RedirectURL  string   `json:"redirectURL" env:"REDIRECT_URL" help:"The redirect url for the OIDC provider."`
	State        string   `json:"state" env:"STATE" help:"The state parameter for the OIDC provider."`
	Scopes       []string `json:"scopes" env:"SCOPES" default:"openid,profile,email,groups" help:"The scopes which should be returned by the OIDC provider."`
}

type SessionConfig struct {
	Token       string        `json:"token" env:"TOKEN" help:"The signing token for the session."`
	Duration    time.Duration `json:"duration" env:"DURATION" default:"168h" help:"The duration for how long a user session is valid."`
	DurationNew Duration      `json:"durationnew" env:"DURATIONNEW" default:"168h" help:"The duration for how long a user session is valid."`
}

type Token struct {
	SessionID primitive.ObjectID `json:"sessionID"`
}

type signinRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type userResponse struct {
	authContext.User
	Dashboards []dashboardv1.Reference `json:"dashboards,omitempty"`
	Navigation []userv1.Navigation     `json:"navigation,omitempty"`
}
