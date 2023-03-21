package instance

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestGetName(t *testing.T) {
	instance := &instance{
		name: "signalsciences",
	}

	require.Equal(t, "signalsciences", instance.GetName())
}

func TestNew(t *testing.T) {
	for _, tt := range []struct {
		name    string
		options map[string]any
		isError bool
	}{
		{
			name:    "instance without auth",
			options: map[string]any{},
			isError: false,
		},
		{
			name:    "instance with basic auth",
			options: map[string]any{"username": "admin", "password": "admin"},
			isError: false,
		},
		{
			name:    "instance with token auth",
			options: map[string]any{"token": "token"},
			isError: false,
		},
		{
			name:    "fail to parse options",
			options: map[string]any{"token": []string{"token"}},
			isError: true,
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			instance, err := New("signalsciences", tt.options)
			if tt.isError {
				require.Error(t, err)
				require.Nil(t, instance)
			} else {
				require.NoError(t, err)
				require.NotNil(t, instance)
			}
		})
	}
}
