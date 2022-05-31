// Code generated by mockery v2.12.3. DO NOT EDIT.

package instance

import (
	context "context"

	alert "github.com/opsgenie/opsgenie-go-sdk-v2/alert"

	incident "github.com/opsgenie/opsgenie-go-sdk-v2/incident"

	instanceincident "github.com/kobsio/kobs/packages/plugin-opsgenie/pkg/instance/incident"

	mock "github.com/stretchr/testify/mock"

	time "time"

	userauthcontext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
)

// MockInstance is an autogenerated mock type for the Instance type
type MockInstance struct {
	mock.Mock
}

// AcknowledgeAlert provides a mock function with given fields: ctx, id, user
func (_m *MockInstance) AcknowledgeAlert(ctx context.Context, id string, user string) error {
	ret := _m.Called(ctx, id, user)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, string, string) error); ok {
		r0 = rf(ctx, id, user)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// CheckPermissions provides a mock function with given fields: pluginName, user, action
func (_m *MockInstance) CheckPermissions(pluginName string, user *userauthcontext.User, action string) error {
	ret := _m.Called(pluginName, user, action)

	var r0 error
	if rf, ok := ret.Get(0).(func(string, *userauthcontext.User, string) error); ok {
		r0 = rf(pluginName, user, action)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// CloseAlert provides a mock function with given fields: ctx, id, user
func (_m *MockInstance) CloseAlert(ctx context.Context, id string, user string) error {
	ret := _m.Called(ctx, id, user)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, string, string) error); ok {
		r0 = rf(ctx, id, user)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// CloseIncident provides a mock function with given fields: ctx, id, user
func (_m *MockInstance) CloseIncident(ctx context.Context, id string, user string) error {
	ret := _m.Called(ctx, id, user)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, string, string) error); ok {
		r0 = rf(ctx, id, user)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// GetAlertDetails provides a mock function with given fields: ctx, id
func (_m *MockInstance) GetAlertDetails(ctx context.Context, id string) (*alert.GetAlertResult, error) {
	ret := _m.Called(ctx, id)

	var r0 *alert.GetAlertResult
	if rf, ok := ret.Get(0).(func(context.Context, string) *alert.GetAlertResult); ok {
		r0 = rf(ctx, id)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*alert.GetAlertResult)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, id)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetAlertLogs provides a mock function with given fields: ctx, id
func (_m *MockInstance) GetAlertLogs(ctx context.Context, id string) ([]alert.AlertLog, error) {
	ret := _m.Called(ctx, id)

	var r0 []alert.AlertLog
	if rf, ok := ret.Get(0).(func(context.Context, string) []alert.AlertLog); ok {
		r0 = rf(ctx, id)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]alert.AlertLog)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, id)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetAlertNotes provides a mock function with given fields: ctx, id
func (_m *MockInstance) GetAlertNotes(ctx context.Context, id string) ([]alert.AlertNote, error) {
	ret := _m.Called(ctx, id)

	var r0 []alert.AlertNote
	if rf, ok := ret.Get(0).(func(context.Context, string) []alert.AlertNote); ok {
		r0 = rf(ctx, id)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]alert.AlertNote)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, id)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetAlerts provides a mock function with given fields: ctx, query
func (_m *MockInstance) GetAlerts(ctx context.Context, query string) ([]alert.Alert, error) {
	ret := _m.Called(ctx, query)

	var r0 []alert.Alert
	if rf, ok := ret.Get(0).(func(context.Context, string) []alert.Alert); ok {
		r0 = rf(ctx, query)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]alert.Alert)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, query)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetIncidentLogs provides a mock function with given fields: ctx, id
func (_m *MockInstance) GetIncidentLogs(ctx context.Context, id string) ([]incident.LogResult, error) {
	ret := _m.Called(ctx, id)

	var r0 []incident.LogResult
	if rf, ok := ret.Get(0).(func(context.Context, string) []incident.LogResult); ok {
		r0 = rf(ctx, id)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]incident.LogResult)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, id)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetIncidentNotes provides a mock function with given fields: ctx, id
func (_m *MockInstance) GetIncidentNotes(ctx context.Context, id string) ([]incident.NoteResult, error) {
	ret := _m.Called(ctx, id)

	var r0 []incident.NoteResult
	if rf, ok := ret.Get(0).(func(context.Context, string) []incident.NoteResult); ok {
		r0 = rf(ctx, id)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]incident.NoteResult)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, id)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetIncidentTimeline provides a mock function with given fields: ctx, id
func (_m *MockInstance) GetIncidentTimeline(ctx context.Context, id string) ([]instanceincident.Entry, error) {
	ret := _m.Called(ctx, id)

	var r0 []instanceincident.Entry
	if rf, ok := ret.Get(0).(func(context.Context, string) []instanceincident.Entry); ok {
		r0 = rf(ctx, id)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]instanceincident.Entry)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, id)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetIncidents provides a mock function with given fields: ctx, query
func (_m *MockInstance) GetIncidents(ctx context.Context, query string) ([]incident.Incident, error) {
	ret := _m.Called(ctx, query)

	var r0 []incident.Incident
	if rf, ok := ret.Get(0).(func(context.Context, string) []incident.Incident); ok {
		r0 = rf(ctx, query)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]incident.Incident)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, query)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
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

// ResolveIncident provides a mock function with given fields: ctx, id, user
func (_m *MockInstance) ResolveIncident(ctx context.Context, id string, user string) error {
	ret := _m.Called(ctx, id, user)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, string, string) error); ok {
		r0 = rf(ctx, id, user)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// SnoozeAlert provides a mock function with given fields: ctx, id, user, duration
func (_m *MockInstance) SnoozeAlert(ctx context.Context, id string, user string, duration time.Duration) error {
	ret := _m.Called(ctx, id, user, duration)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, string, string, time.Duration) error); ok {
		r0 = rf(ctx, id, user, duration)
	} else {
		r0 = ret.Error(0)
	}

	return r0
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
