// Code generated by mockery v2.9.4. DO NOT EDIT.

package monitor

import (
	context "context"

	armmonitor "github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/monitor/armmonitor"

	mock "github.com/stretchr/testify/mock"
)

// MockClient is an autogenerated mock type for the Client type
type MockClient struct {
	mock.Mock
}

// GetMetrics provides a mock function with given fields: ctx, resourceGroup, provider, metricNames, aggregationType, timeStart, timeEnd
func (_m *MockClient) GetMetrics(ctx context.Context, resourceGroup string, provider string, metricNames string, aggregationType string, timeStart int64, timeEnd int64) ([]*armmonitor.Metric, error) {
	ret := _m.Called(ctx, resourceGroup, provider, metricNames, aggregationType, timeStart, timeEnd)

	var r0 []*armmonitor.Metric
	if rf, ok := ret.Get(0).(func(context.Context, string, string, string, string, int64, int64) []*armmonitor.Metric); ok {
		r0 = rf(ctx, resourceGroup, provider, metricNames, aggregationType, timeStart, timeEnd)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]*armmonitor.Metric)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string, string, string, string, int64, int64) error); ok {
		r1 = rf(ctx, resourceGroup, provider, metricNames, aggregationType, timeStart, timeEnd)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}
