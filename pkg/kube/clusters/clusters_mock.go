// Code generated by mockery v2.12.3. DO NOT EDIT.

package clusters

import (
	context "context"

	cluster "github.com/kobsio/kobs/pkg/kube/clusters/cluster"

	mock "github.com/stretchr/testify/mock"
)

// MockClient is an autogenerated mock type for the Client type
type MockClient struct {
	mock.Mock
}

// GetCluster provides a mock function with given fields: ctx, name
func (_m *MockClient) GetCluster(ctx context.Context, name string) cluster.Client {
	ret := _m.Called(ctx, name)

	var r0 cluster.Client
	if rf, ok := ret.Get(0).(func(context.Context, string) cluster.Client); ok {
		r0 = rf(ctx, name)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(cluster.Client)
		}
	}

	return r0
}

// GetClusters provides a mock function with given fields: ctx
func (_m *MockClient) GetClusters(ctx context.Context) []cluster.Client {
	ret := _m.Called(ctx)

	var r0 []cluster.Client
	if rf, ok := ret.Get(0).(func(context.Context) []cluster.Client); ok {
		r0 = rf(ctx)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]cluster.Client)
		}
	}

	return r0
}

type NewMockClientT interface {
	mock.TestingT
	Cleanup(func())
}

// NewMockClient creates a new instance of MockClient. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
func NewMockClient(t NewMockClientT) *MockClient {
	mock := &MockClient{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}