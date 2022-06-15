package api

import (
	"github.com/kobsio/kobs/pkg/hub/api/users"
)

type Config struct {
	Users users.Config `json:"users"`
}
