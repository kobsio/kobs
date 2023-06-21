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

// GetLogs mocks base method.
func (m *MockInstance) GetLogs(ctx context.Context, query, indexPattern, timestampField string, timeStart, timeEnd int64) (*Data, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetLogs", ctx, query, indexPattern, timestampField, timeStart, timeEnd)
	ret0, _ := ret[0].(*Data)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetLogs indicates an expected call of GetLogs.
func (mr *MockInstanceMockRecorder) GetLogs(ctx, query, indexPattern, timestampField, timeStart, timeEnd interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetLogs", reflect.TypeOf((*MockInstance)(nil).GetLogs), ctx, query, indexPattern, timestampField, timeStart, timeEnd)
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
