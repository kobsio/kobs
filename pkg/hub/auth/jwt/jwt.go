package jwt

import (
	"fmt"
	"time"

	goJWT "github.com/golang-jwt/jwt/v4"
)

// CustomClaims is the struct which defines the claims for our jwt tokens.
type CustomClaims[T any] struct {
	Data *T `json:"data,omitempty"`
	goJWT.RegisteredClaims
}

// ValidateToken validates a given jwt token and returns the user from the claims or an error when the validation fails.
func ValidateToken[T any](tokenString, sessionToken string) (*T, error) {
	token, err := goJWT.ParseWithClaims(tokenString, &CustomClaims[T]{}, func(token *goJWT.Token) (any, error) {
		if _, ok := token.Method.(*goJWT.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		return []byte(sessionToken), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*CustomClaims[T])
	if ok && token.Valid {
		return claims.Data, nil
	}

	return nil, fmt.Errorf("invalid jwt claims")
}

// CreateToken creates a new signed jwt token with the user information saved in the claims.
func CreateToken[T any](data *T, sessionToken string, sessionInterval time.Duration) (string, error) {
	if sessionInterval < 0 {
		return "", fmt.Errorf("invalid session interval")
	}

	claims := CustomClaims[T]{
		data,
		goJWT.RegisteredClaims{
			ExpiresAt: goJWT.NewNumericDate(time.Now().Add(sessionInterval)),
			Issuer:    "kobs.io",
		},
	}

	token := goJWT.NewWithClaims(goJWT.SigningMethodHS256, claims)
	return token.SignedString([]byte(sessionToken))
}
