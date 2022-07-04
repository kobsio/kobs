package instance

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestNew(t *testing.T) {
	for _, tt := range []struct {
		name    string
		options map[string]any
		isError bool
	}{
		{
			name:    "instance without credentials",
			options: map[string]any{},
			isError: true,
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			instance, err := New("azure", tt.options)
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
