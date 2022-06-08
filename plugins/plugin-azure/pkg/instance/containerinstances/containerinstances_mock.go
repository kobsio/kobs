// Code generated by mockery v2.12.3. DO NOT EDIT.

package containerinstances

import (
	context "context"

	armcontainerinstance "github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/containerinstance/armcontainerinstance"

	mock "github.com/stretchr/testify/mock"
)

// MockClient is an autogenerated mock type for the Client type
type MockClient struct {
	mock.Mock
}

// GetContainerGroup provides a mock function with given fields: ctx, resourceGroup, containerGroup
func (_m *MockClient) GetContainerGroup(ctx context.Context, resourceGroup string, containerGroup string) (armcontainerinstance.ContainerGroupsClientGetResponse, error) {
	ret := _m.Called(ctx, resourceGroup, containerGroup)

	var r0 armcontainerinstance.ContainerGroupsClientGetResponse
	if rf, ok := ret.Get(0).(func(context.Context, string, string) armcontainerinstance.ContainerGroupsClientGetResponse); ok {
		r0 = rf(ctx, resourceGroup, containerGroup)
	} else {
		r0 = ret.Get(0).(armcontainerinstance.ContainerGroupsClientGetResponse)
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string, string) error); ok {
		r1 = rf(ctx, resourceGroup, containerGroup)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetContainerLogs provides a mock function with given fields: ctx, resourceGroup, containerGroup, container, tail, timestamps
func (_m *MockClient) GetContainerLogs(ctx context.Context, resourceGroup string, containerGroup string, container string, tail *int32, timestamps *bool) (*string, error) {
	ret := _m.Called(ctx, resourceGroup, containerGroup, container, tail, timestamps)

	var r0 *string
	if rf, ok := ret.Get(0).(func(context.Context, string, string, string, *int32, *bool) *string); ok {
		r0 = rf(ctx, resourceGroup, containerGroup, container, tail, timestamps)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*string)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string, string, string, *int32, *bool) error); ok {
		r1 = rf(ctx, resourceGroup, containerGroup, container, tail, timestamps)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// ListContainerGroups provides a mock function with given fields: ctx, resourceGroup
func (_m *MockClient) ListContainerGroups(ctx context.Context, resourceGroup string) ([]*armcontainerinstance.ContainerGroup, error) {
	ret := _m.Called(ctx, resourceGroup)

	var r0 []*armcontainerinstance.ContainerGroup
	if rf, ok := ret.Get(0).(func(context.Context, string) []*armcontainerinstance.ContainerGroup); ok {
		r0 = rf(ctx, resourceGroup)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]*armcontainerinstance.ContainerGroup)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, resourceGroup)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// RestartContainerGroup provides a mock function with given fields: ctx, resourceGroup, containerGroup
func (_m *MockClient) RestartContainerGroup(ctx context.Context, resourceGroup string, containerGroup string) error {
	ret := _m.Called(ctx, resourceGroup, containerGroup)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, string, string) error); ok {
		r0 = rf(ctx, resourceGroup, containerGroup)
	} else {
		r0 = ret.Error(0)
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
