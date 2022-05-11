package userauth

import (
	"testing"
	"time"

	"github.com/kobsio/kobs/pkg/hub/store"
	"github.com/stretchr/testify/require"
)

func TestHandler(t *testing.T) {
	require.NotEmpty(t, Handler(false, "", "", "", 10*time.Second, &store.MockClient{}))
}
