package helpers

import (
	"encoding/base64"
	"encoding/json"
	"net/http"

	"golang.org/x/oauth2"
)

// tokenToBase64 marshals a given oauth2 token into a json string and then encodes the string to base64, so that it can
// be used as cookie value.
func tokenToBase64(token *oauth2.Token) (string, error) {
	tokenStr, err := json.Marshal(token)
	if err != nil {
		return "", err
	}

	return base64.StdEncoding.EncodeToString([]byte(tokenStr)), nil
}

// tokenFromBase64 decodes a base64 string and unmarshals the json string into an oauth2 token.
func tokenFromBase64(tokenStr string) (*oauth2.Token, error) {
	tokenStrDec, err := base64.StdEncoding.DecodeString(tokenStr)
	if err != nil {
		return nil, err
	}

	var token oauth2.Token
	if err := json.Unmarshal(tokenStrDec, &token); err != nil {
		return nil, err
	}

	return &token, nil
}

// TokenToCookie returns a cookie for the given oauth token.
func TokenToCookie(token *oauth2.Token) (*http.Cookie, error) {
	cookieValue, err := tokenToBase64(token)
	if err != nil {
		return nil, err
	}

	return &http.Cookie{
		Name:     "kobs-oauth-github",
		Value:    cookieValue,
		Secure:   false,
		HttpOnly: false,
		Path:     "/",
	}, nil
}

// TokenFromCookie returns the token from the "kobs-oauth-github" cookie in the given request.
func TokenFromCookie(r *http.Request) (*oauth2.Token, error) {
	cookie, err := r.Cookie("kobs-oauth-github")
	if err != nil {
		return nil, err
	}

	return tokenFromBase64(cookie.Value)
}
