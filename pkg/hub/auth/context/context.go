package context

import (
	"context"
	"fmt"
)

// Key to use when setting the user.
type ctxKeyUser int

// UserKey is the key that holds the user in a request context.
const UserKey ctxKeyUser = 0

// GetUser returns a user from the given context if one is present. If there is no user in the current context an error
// is returned.
func GetUser(ctx context.Context) (*User, error) {
	if ctx == nil {
		return nil, fmt.Errorf("Unauthorized")
	}

	if user, ok := ctx.Value(UserKey).(User); ok {
		return &user, nil
	}

	return nil, fmt.Errorf("Unauthorized")
}

// MustGetUser returns a user from the given context if one is present. If there is no user in the current context the
// function throws a panic.
//
// This is similar to the GetUser function but allows us to simplify the code to get the user, where we are sure that
// the user must be present in a request context.
func MustGetUser(ctx context.Context) *User {
	user, err := GetUser(ctx)
	if err != nil {
		panic(err)
	}

	return user
}
