package userauth

import (
	"net/http"
	"time"

	"github.com/kobsio/kobs/pkg/hub/store"
)

// Handler creates a new Auth handler with the options defined via the above flags.
func Handler(enabled bool, headerUser, headerTeams, sessionToken string, sessionInterval time.Duration, storeClient store.Client) func(next http.Handler) http.Handler {
	a := New(enabled, headerUser, headerTeams, sessionToken, sessionInterval, storeClient)
	return a.Handler
}
