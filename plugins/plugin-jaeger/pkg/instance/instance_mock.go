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

// GetOperations provides a mock function with given fields: ctx, service
func (_m *MockInstance) GetOperations(ctx context.Context, service string) (map[string]interface{}, error) {
	ret := _m.Called(ctx, service)

	var r0 map[string]interface{}
	if rf, ok := ret.Get(0).(func(context.Context, string) map[string]interface{}); ok {
		r0 = rf(ctx, service)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(map[string]interface{})
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, service)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetServices provides a mock function with given fields: ctx
func (_m *MockInstance) GetServices(ctx context.Context) (map[string]interface{}, error) {
	ret := _m.Called(ctx)

	var r0 map[string]interface{}
	if rf, ok := ret.Get(0).(func(context.Context) map[string]interface{}); ok {
		r0 = rf(ctx)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(map[string]interface{})
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

// GetTrace provides a mock function with given fields: ctx, traceID
func (_m *MockInstance) GetTrace(ctx context.Context, traceID string) (map[string]interface{}, error) {
	ret := _m.Called(ctx, traceID)

	var r0 map[string]interface{}
	if rf, ok := ret.Get(0).(func(context.Context, string) map[string]interface{}); ok {
		r0 = rf(ctx, traceID)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(map[string]interface{})
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, traceID)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetTraces provides a mock function with given fields: ctx, limit, maxDuration, minDuration, operation, service, tags, timeStart, timeEnd
func (_m *MockInstance) GetTraces(ctx context.Context, limit string, maxDuration string, minDuration string, operation string, service string, tags string, timeStart int64, timeEnd int64) (map[string]interface{}, error) {
	ret := _m.Called(ctx, limit, maxDuration, minDuration, operation, service, tags, timeStart, timeEnd)

	var r0 map[string]interface{}
	if rf, ok := ret.Get(0).(func(context.Context, string, string, string, string, string, string, int64, int64) map[string]interface{}); ok {
		r0 = rf(ctx, limit, maxDuration, minDuration, operation, service, tags, timeStart, timeEnd)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(map[string]interface{})
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string, string, string, string, string, string, int64, int64) error); ok {
		r1 = rf(ctx, limit, maxDuration, minDuration, operation, service, tags, timeStart, timeEnd)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// doRequest provides a mock function with given fields: ctx, url
func (_m *MockInstance) doRequest(ctx context.Context, url string) (map[string]interface{}, error) {
	ret := _m.Called(ctx, url)

	var r0 map[string]interface{}
	if rf, ok := ret.Get(0).(func(context.Context, string) map[string]interface{}); ok {
		r0 = rf(ctx, url)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(map[string]interface{})
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
