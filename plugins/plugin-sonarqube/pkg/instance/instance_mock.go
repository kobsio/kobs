// Code generated by mockery v2.12.3. DO NOT EDIT.

package instance

import (
	context "context"

	mock "github.com/stretchr/testify/mock"
)

// MockInstance is an autogenerated mock type for the Instance type
type MockInstance struct {
	mock.Mock
}

// GetName provides a mock function with given fields:
func (_m *MockInstance) GetName() string {
	ret := _m.Called()

	var r0 string
	if rf, ok := ret.Get(0).(func() string); ok {
		r0 = rf()
	} else {
		r0 = ret.Get(0).(string)
	}

	return r0
}

// GetProjectMeasures provides a mock function with given fields: ctx, project, metricKeys
func (_m *MockInstance) GetProjectMeasures(ctx context.Context, project string, metricKeys []string) (*ResponseProjectMeasures, error) {
	ret := _m.Called(ctx, project, metricKeys)

	var r0 *ResponseProjectMeasures
	if rf, ok := ret.Get(0).(func(context.Context, string, []string) *ResponseProjectMeasures); ok {
		r0 = rf(ctx, project, metricKeys)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*ResponseProjectMeasures)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string, []string) error); ok {
		r1 = rf(ctx, project, metricKeys)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetProjects provides a mock function with given fields: ctx, query, pageSize, pageNumber
func (_m *MockInstance) GetProjects(ctx context.Context, query string, pageSize string, pageNumber string) (*ResponseProjects, error) {
	ret := _m.Called(ctx, query, pageSize, pageNumber)

	var r0 *ResponseProjects
	if rf, ok := ret.Get(0).(func(context.Context, string, string, string) *ResponseProjects); ok {
		r0 = rf(ctx, query, pageSize, pageNumber)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*ResponseProjects)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string, string, string) error); ok {
		r1 = rf(ctx, query, pageSize, pageNumber)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// doRequest provides a mock function with given fields: ctx, url
func (_m *MockInstance) doRequest(ctx context.Context, url string) ([]byte, error) {
	ret := _m.Called(ctx, url)

	var r0 []byte
	if rf, ok := ret.Get(0).(func(context.Context, string) []byte); ok {
		r0 = rf(ctx, url)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]byte)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, url)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

type NewMockInstanceT interface {
	mock.TestingT
	Cleanup(func())
}

// NewMockInstance creates a new instance of MockInstance. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
func NewMockInstance(t NewMockInstanceT) *MockInstance {
	mock := &MockInstance{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}