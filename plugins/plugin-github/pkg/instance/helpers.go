package instance

import (
	"encoding/base64"
	"encoding/json"

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
