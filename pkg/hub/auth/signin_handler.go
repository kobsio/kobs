package auth

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/render"
	"github.com/kobsio/kobs/pkg/hub/auth/jwt"
	"github.com/kobsio/kobs/pkg/hub/auth/refreshtoken"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
)

type signinRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type session struct {
	Email string   `json:"email"`
	Teams []string `json:"teams"`
}

// getUserFromConfig returns a user with the given email from the configured users.
func (c *client) getUserFromConfig(email string) *userConfig {
	for _, user := range c.config.Users {
		if user.Email == email {
			return &user
		}
	}

	return nil
}

// signinHandler handles the login of users, which are provided via the configuration file of the hub. For that we have
// to check if the user from the request is present in the configuration and if the provided password matches the
// configured password. If this is the case we are are creating a session object with all the users email and teams. The
// session can then be used to get the users permissions in the authentication middleware.
func (c *client) signinHandler(w http.ResponseWriter, r *http.Request) {
	var signinRequest signinRequest

	err := json.NewDecoder(r.Body).Decode(&signinRequest)
	if err != nil {
		log.Warn(r.Context(), "Failed to decode request body", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to decode request body")
		return
	}

	userConfig := c.getUserFromConfig(signinRequest.Email)
	if userConfig == nil {
		// When no user is found for the provided email address, we use a fixed password hash to prevent user
		// enumeration by timing requests. Here we are comparing the bcrypt-hashed version of "fakepassword" against
		// the user provided password.
		bcrypt.CompareHashAndPassword([]byte("$2y$10$UPPBv.HThEllgJZINbFwYOsru62d.LT0EqG3XLug2pG81IvemopH2"), []byte(signinRequest.Password))

		log.Warn(r.Context(), "Invalid email or password")
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid email or password")
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(userConfig.Password), []byte(signinRequest.Password))
	if err != nil {
		log.Warn(r.Context(), "Invalid email or password", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid email or password")
		return
	}

	accessToken, err := jwt.CreateToken(&session{Email: userConfig.Email, Teams: userConfig.Groups}, c.config.Session.Token, c.config.Session.ParsedInterval)
	if err != nil {
		log.Warn(r.Context(), "Failed to create jwt token", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to create jwt token")
		return
	}

	refreshToken, err := refreshtoken.Token{
		Type:   refreshtoken.Credentials,
		Value:  userConfig.getHash(),
		UserID: userConfig.Email,
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

	render.Status(r, http.StatusNoContent)
	render.JSON(w, r, nil)
}
