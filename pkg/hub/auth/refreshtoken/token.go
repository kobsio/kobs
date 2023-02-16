package refreshtoken

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
)

type TokenType string

const (
	OIDC        TokenType = "oidc"
	Credentials TokenType = "credentials"
)

type Token struct {
	Type   TokenType `json:"type"`
	Value  string    `json:"value"`
	UserID string    `json:"userID"`
}

func (t Token) Encode() (string, error) {
	if bytes, err := json.Marshal(t); err != nil {
		return "", err
	} else {
		return base64.StdEncoding.EncodeToString(bytes), nil
	}
}

func FromString(raw string) (Token, error) {
	str, err := base64.StdEncoding.DecodeString(raw)
	if err != nil {
		return Token{}, fmt.Errorf("couldn't decode raw token, %w", err)
	}

	var t Token
	err = json.Unmarshal([]byte(str), &t)
	if err != nil {
		return Token{}, err
	}

	return t, nil
}
