package auth

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/require"
)

type TestDuration struct {
	Value Duration `json:"value"`
}

func TestDurationUnmarshalJSON(t *testing.T) {
	t.Run("should unmarshal json into duration", func(t *testing.T) {
		var data TestDuration
		err := json.Unmarshal([]byte("{\"value\":\"168h\"}"), &data)
		require.NoError(t, err)
		require.Equal(t, 168.0, data.Value.Duration.Hours())
	})

	t.Run("should fail to unmarshal invalid json value into duration", func(t *testing.T) {
		var data TestDuration
		err := json.Unmarshal([]byte("{\"value\":\"168\"}"), &data)
		require.Error(t, err)
	})

	t.Run("should unmarshal string into duration", func(t *testing.T) {
		var data Duration
		err := data.UnmarshalJSON([]byte("168h"))
		require.NoError(t, err)
		require.Equal(t, 168.0, data.Duration.Hours())
	})

	t.Run("should fail to unmarshal invalid duration into duration", func(t *testing.T) {
		var data Duration
		err := data.UnmarshalJSON([]byte("168"))
		require.Error(t, err)
	})
}
