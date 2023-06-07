package costmanagement

import (
	"testing"
	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/costmanagement/armcostmanagement"
	"github.com/stretchr/testify/require"
)

func TestBuildQueryParams(t *testing.T) {
	t.Run("subscription scope", func(t *testing.T) {
		actualQueryParams := buildQueryParams(true, 0, 1)
		from := time.Unix(0, 0)
		to := time.Unix(1, 0)

		require.Equal(t, armcostmanagement.ExportTypeActualCost, *actualQueryParams.Type)
		require.Equal(t, armcostmanagement.TimeframeTypeCustom, *actualQueryParams.Timeframe)
		require.Equal(t, armcostmanagement.QueryTimePeriod{From: &from, To: &to}, *actualQueryParams.TimePeriod)
	})

	t.Run("not subscription scope", func(t *testing.T) {
		actualQueryParams := buildQueryParams(false, 0, 1)
		from := time.Unix(0, 0)
		to := time.Unix(1, 0)

		require.Equal(t, armcostmanagement.ExportTypeActualCost, *actualQueryParams.Type)
		require.Equal(t, armcostmanagement.TimeframeTypeCustom, *actualQueryParams.Timeframe)
		require.Equal(t, armcostmanagement.QueryTimePeriod{From: &from, To: &to}, *actualQueryParams.TimePeriod)
	})
}
