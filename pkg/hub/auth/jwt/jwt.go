package jwt

import (
	"fmt"
	"time"

	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"

	goJWT "github.com/golang-jwt/jwt/v4"
)

// CustomClaims is the struct which defines the claims for our jwt tokens.
type CustomClaims struct {
	User authContext.User
	goJWT.RegisteredClaims
}

// ValidateToken validates a given jwt token and returns the user from the claims or an error when the validation fails.
func ValidateToken(tokenString, sessionToken string) (*authContext.User, error) {
	token, err := goJWT.ParseWithClaims(tokenString, &CustomClaims{}, func(token *goJWT.Token) (any, error) {
		if _, ok := token.Method.(*goJWT.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		return []byte(sessionToken), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*CustomClaims)
	if ok && token.Valid {
		return &claims.User, nil
	}

	return nil, fmt.Errorf("invalid jwt claims")
}

// CreateToken creates a new signed jwt token with the user information saved in the claims.
func CreateToken(user authContext.User, sessionToken string, sessionInterval time.Duration) (string, error) {
	if sessionInterval < 0 {
		return "", fmt.Errorf("invalid session interval")
	}

	claims := CustomClaims{
		user,
		goJWT.RegisteredClaims{
			ExpiresAt: goJWT.NewNumericDate(time.Now().Add(sessionInterval)),
			Issuer:    "kobs.io",
		},
	}

	token := goJWT.NewWithClaims(goJWT.SigningMethodHS256, claims)
	return token.SignedString([]byte(sessionToken))
}
