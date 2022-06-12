package costmanagement

import (
	"testing"
	"time"

	"github.com/Azure/azure-sdk-for-go/services/costmanagement/mgmt/2019-11-01/costmanagement"
	"github.com/Azure/go-autorest/autorest/date"
	"github.com/stretchr/testify/require"
)

func TestBuildQueryParams(t *testing.T) {
	t.Run("subscription scope", func(t *testing.T) {
		actualQueryParams := buildQueryParams(true, 0, 1)

		require.Equal(t, costmanagement.ExportTypeActualCost, actualQueryParams.Type)
		require.Equal(t, costmanagement.TimeframeTypeCustom, actualQueryParams.Timeframe)
		require.Equal(t, costmanagement.QueryTimePeriod{From: &date.Time{Time: time.Unix(0, 0)}, To: &date.Time{Time: time.Unix(1, 0)}}, *actualQueryParams.TimePeriod)
	})

	t.Run("not subscription scope", func(t *testing.T) {
		actualQueryParams := buildQueryParams(false, 0, 1)

		require.Equal(t, costmanagement.ExportTypeActualCost, actualQueryParams.Type)
		require.Equal(t, costmanagement.TimeframeTypeCustom, actualQueryParams.Timeframe)
		require.Equal(t, costmanagement.QueryTimePeriod{From: &date.Time{Time: time.Unix(0, 0)}, To: &date.Time{Time: time.Unix(1, 0)}}, *actualQueryParams.TimePeriod)
	})
}
