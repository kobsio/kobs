package satellites

import (
	"testing"

	"github.com/stretchr/testify/require"
)

var testConfig = Config{{
	Name:    "foobar",
	Address: "http://localhost:15221",
	Token:   "unsecure",
}}

func TestGetSatellites(t *testing.T) {
	client, _ := NewClient(testConfig)
	satellites := client.GetSatellites()

	require.NotEmpty(t, satellites)
	require.Equal(t, testConfig[0].Name, satellites[0].GetName())
}

func TestGetAddress(t *testing.T) {
	client, _ := NewClient(testConfig)

	t.Run("satellite found", func(t *testing.T) {
		satellite := client.GetSatellite("foobar")
		require.NotEmpty(t, satellite)
	})

	t.Run("satellite not found", func(t *testing.T) {
		satellite := client.GetSatellite("helloworld")
		require.Empty(t, satellite)
	})
}

func TestNewClient(t *testing.T) {
	t.Run("create new client fails", func(t *testing.T) {
		_, err := NewClient(Config{{Address: " http://localhost:15221"}})
		require.Error(t, err)
	})

	t.Run("create new client succeeds", func(t *testing.T) {
		client, err := NewClient(Config{{Address: "http://localhost:15221"}})
		require.NoError(t, err)
		require.NotEmpty(t, client)
	})
}
