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

// GetProjectMeasures mocks base method.
func (m *MockInstance) GetProjectMeasures(ctx context.Context, project string, metricKeys []string) (*ResponseProjectMeasures, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetProjectMeasures", ctx, project, metricKeys)
	ret0, _ := ret[0].(*ResponseProjectMeasures)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetProjectMeasures indicates an expected call of GetProjectMeasures.
func (mr *MockInstanceMockRecorder) GetProjectMeasures(ctx, project, metricKeys interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetProjectMeasures", reflect.TypeOf((*MockInstance)(nil).GetProjectMeasures), ctx, project, metricKeys)
}

// GetProjects mocks base method.
func (m *MockInstance) GetProjects(ctx context.Context, query, page, perPage string) (*ResponseProjects, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetProjects", ctx, query, page, perPage)
	ret0, _ := ret[0].(*ResponseProjects)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetProjects indicates an expected call of GetProjects.
func (mr *MockInstanceMockRecorder) GetProjects(ctx, query, page, perPage interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetProjects", reflect.TypeOf((*MockInstance)(nil).GetProjects), ctx, query, page, perPage)
}
