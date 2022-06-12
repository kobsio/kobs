package costmanagement

import (
	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/to"
	"github.com/Azure/azure-sdk-for-go/services/costmanagement/mgmt/2019-11-01/costmanagement"
	"github.com/Azure/go-autorest/autorest/date"
)

func buildQueryParams(subscriptionScope bool, timeStart, timeEnd int64) costmanagement.QueryDefinition {
	agg := make(map[string]*costmanagement.QueryAggregation)
	tc := costmanagement.QueryAggregation{
		Name:     to.Ptr("Cost"),
		Function: costmanagement.FunctionTypeSum,
	}
	agg["totalCost"] = &tc

	var grouping []costmanagement.QueryGrouping
	if subscriptionScope {
		grouping = []costmanagement.QueryGrouping{
			{
				Type: costmanagement.QueryColumnTypeDimension,
				Name: to.Ptr("resourceGroup"),
			},
		}
	} else {
		grouping = []costmanagement.QueryGrouping{
			{
				Type: costmanagement.QueryColumnTypeDimension,
				Name: to.Ptr("ServiceName"),
			},
		}
	}

	ds := costmanagement.QueryDataset{
		Granularity:   "None",
		Configuration: nil,
		Aggregation:   agg,
		Grouping:      &grouping,
		Filter:        nil,
	}

	now := date.Time{Time: time.Unix(timeEnd, 0)}
	from := date.Time{Time: time.Unix(timeStart, 0)}
	tp := costmanagement.QueryTimePeriod{
		From: &from,
		To:   &now,
	}

	return costmanagement.QueryDefinition{
		Type:       costmanagement.ExportTypeActualCost,
		Timeframe:  costmanagement.TimeframeTypeCustom,
		TimePeriod: &tp,
		Dataset:    &ds,
	}
}
