// Code generated by mockery v2.12.3. DO NOT EDIT.

package resourcegroups

import (
	context "context"

	armresources "github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/resources/armresources"

	mock "github.com/stretchr/testify/mock"
)

// MockClient is an autogenerated mock type for the Client type
type MockClient struct {
	mock.Mock
}

// ListResourceGroups provides a mock function with given fields: ctx
func (_m *MockClient) ListResourceGroups(ctx context.Context) ([]*armresources.ResourceGroup, error) {
	ret := _m.Called(ctx)

	var r0 []*armresources.ResourceGroup
	if rf, ok := ret.Get(0).(func(context.Context) []*armresources.ResourceGroup); ok {
		r0 = rf(ctx)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]*armresources.ResourceGroup)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context) error); ok {
		r1 = rf(ctx)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
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