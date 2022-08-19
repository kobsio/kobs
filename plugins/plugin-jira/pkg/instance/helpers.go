package instance

import (
	"encoding/base64"
	"encoding/json"
)

type Token struct {
	Email string `json:"email"`
	Token string `json:"token"`
}

// tokenToBase64 marshals a given token into a json string and then encodes the string to base64, so that it can be used
// as cookie value.
func tokenToBase64(token *Token) (string, error) {
	tokenStr, err := json.Marshal(token)
	if err != nil {
		return "", err
	}

	return base64.StdEncoding.EncodeToString([]byte(tokenStr)), nil
}

// tokenFromBase64 decodes a base64 string and unmarshals the json string into an token.
func tokenFromBase64(tokenStr string) (*Token, error) {
	tokenStrDec, err := base64.StdEncoding.DecodeString(tokenStr)
	if err != nil {
		return nil, err
	}

	var token Token
	if err := json.Unmarshal(tokenStrDec, &token); err != nil {
		return nil, err
	}

	return &token, nil
}
