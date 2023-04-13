// Code generated by MockGen. DO NOT EDIT.
// Source: instance.go

// Package instance is a generated GoMock package.
package instance

import (
	context "context"
	reflect "reflect"

	gomock "github.com/golang/mock/gomock"
)

// MockInstance is a mock of Instance interface.
type MockInstance struct {
	ctrl     *gomock.Controller
	recorder *MockInstanceMockRecorder
}

// MockInstanceMockRecorder is the mock recorder for MockInstance.
type MockInstanceMockRecorder struct {
	mock *MockInstance
}

// NewMockInstance creates a new mock instance.
func NewMockInstance(ctrl *gomock.Controller) *MockInstance {
	mock := &MockInstance{ctrl: ctrl}
	mock.recorder = &MockInstanceMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use.
func (m *MockInstance) EXPECT() *MockInstanceMockRecorder {
	return m.recorder
}

// GetCompletions mocks base method.
func (m *MockInstance) GetCompletions() map[string][]string {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetCompletions")
	ret0, _ := ret[0].(map[string][]string)
	return ret0
}

// GetCompletions indicates an expected call of GetCompletions.
func (mr *MockInstanceMockRecorder) GetCompletions() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetCompletions", reflect.TypeOf((*MockInstance)(nil).GetCompletions))
}

// GetDialect mocks base method.
func (m *MockInstance) GetDialect() string {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetDialect")
	ret0, _ := ret[0].(string)
	return ret0
}

// GetDialect indicates an expected call of GetDialect.
func (mr *MockInstanceMockRecorder) GetDialect() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetDialect", reflect.TypeOf((*MockInstance)(nil).GetDialect))
}

// GetName mocks base method.
func (m *MockInstance) GetName() string {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetName")
	ret0, _ := ret[0].(string)
	return ret0
}

// GetName indicates an expected call of GetName.
func (mr *MockInstanceMockRecorder) GetName() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetName", reflect.TypeOf((*MockInstance)(nil).GetName))
}

// GetQueryResults mocks base method.
func (m *MockInstance) GetQueryResults(ctx context.Context, query string) ([]map[string]any, []string, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetQueryResults", ctx, query)
	ret0, _ := ret[0].([]map[string]any)
	ret1, _ := ret[1].([]string)
	ret2, _ := ret[2].(error)
	return ret0, ret1, ret2
}

// GetQueryResults indicates an expected call of GetQueryResults.
func (mr *MockInstanceMockRecorder) GetQueryResults(ctx, query interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetQueryResults", reflect.TypeOf((*MockInstance)(nil).GetQueryResults), ctx, query)
}
