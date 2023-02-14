package refreshtoken

import "encoding/json"

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
		return string(bytes), nil
	}
}

func FromString(raw string) (t Token, err error) {
	err = json.Unmarshal([]byte(raw), &t)
	return
}
