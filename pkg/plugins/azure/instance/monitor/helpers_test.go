package monitor

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestGetMetricsOptions(t *testing.T) {
	actualInterval, actualTimespan, actualTop := getMetricsOptions("auto", 1609502400, 1609509600)
	require.Equal(t, "PT1M", actualInterval)
	require.Equal(t, "2021-01-01T12:00:00/2021-01-01T14:00:00", actualTimespan)
	require.Equal(t, int32(500), actualTop)
}

func TestGetInterval(t *testing.T) {
	require.Equal(t, "PT1M", getInterval("auto", 0, 21600))
	require.Equal(t, "PT5M", getInterval("auto", 0, 86400))
	require.Equal(t, "PT15M", getInterval("auto", 0, 259200))
	require.Equal(t, "PT30M", getInterval("auto", 0, 518400))
	require.Equal(t, "PT1H", getInterval("auto", 0, 1036800))
	require.Equal(t, "PT6H", getInterval("auto", 0, 2073600))
	require.Equal(t, "PT12H", getInterval("auto", 0, 4147200))
	require.Equal(t, "P1D", getInterval("auto", 0, 8294400))
}
