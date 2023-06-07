package costmanagement

import (
	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/to"
	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/costmanagement/armcostmanagement"
)

func buildQueryParams(subscriptionScope bool, timeStart, timeEnd int64) armcostmanagement.QueryDefinition {
	functionTypeSum := armcostmanagement.FunctionTypeSum
	queryColumnTypeDimension := armcostmanagement.QueryColumnTypeDimension
	exportTypeActualCost := armcostmanagement.ExportTypeActualCost
	timeframeTypeCustom := armcostmanagement.TimeframeTypeCustom

	agg := make(map[string]*armcostmanagement.QueryAggregation)
	tc := armcostmanagement.QueryAggregation{
		Name:     to.Ptr("Cost"),
		Function: &functionTypeSum,
	}
	agg["totalCost"] = &tc

	var grouping []*armcostmanagement.QueryGrouping
	if subscriptionScope {
		grouping = append(grouping, &armcostmanagement.QueryGrouping{
			Type: &queryColumnTypeDimension,
			Name: to.Ptr("resourceGroup"),
		})
	} else {
		grouping = append(grouping, &armcostmanagement.QueryGrouping{
			Type: &queryColumnTypeDimension,
			Name: to.Ptr("ServiceName"),
		})
	}

	ds := armcostmanagement.QueryDataset{
		// Granularity:   "None",
		Configuration: nil,
		Aggregation:   agg,
		Grouping:      grouping,
		Filter:        nil,
	}

	now := time.Unix(timeEnd, 0)
	from := time.Unix(timeStart, 0)
	tp := armcostmanagement.QueryTimePeriod{
		From: &from,
		To:   &now,
	}

	return armcostmanagement.QueryDefinition{
		Type:       &exportTypeActualCost,
		Timeframe:  &timeframeTypeCustom,
		TimePeriod: &tp,
		Dataset:    &ds,
	}
}
