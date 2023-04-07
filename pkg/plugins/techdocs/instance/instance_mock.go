// Code generated by MockGen. DO NOT EDIT.
// Source: instance.go

// Package instance is a generated GoMock package.
package instance

import (
	context "context"
	reflect "reflect"

	gomock "github.com/golang/mock/gomock"
	shared "github.com/kobsio/kobs/pkg/plugins/techdocs/shared"
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

// GetFile mocks base method.
func (m *MockInstance) GetFile(ctx context.Context, service, path string) ([]byte, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetFile", ctx, service, path)
	ret0, _ := ret[0].([]byte)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetFile indicates an expected call of GetFile.
func (mr *MockInstanceMockRecorder) GetFile(ctx, service, path interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetFile", reflect.TypeOf((*MockInstance)(nil).GetFile), ctx, service, path)
}

// GetIndex mocks base method.
func (m *MockInstance) GetIndex(ctx context.Context, service string) (*shared.Index, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetIndex", ctx, service)
	ret0, _ := ret[0].(*shared.Index)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetIndex indicates an expected call of GetIndex.
func (mr *MockInstanceMockRecorder) GetIndex(ctx, service interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetIndex", reflect.TypeOf((*MockInstance)(nil).GetIndex), ctx, service)
}

// GetIndexes mocks base method.
func (m *MockInstance) GetIndexes(ctx context.Context) ([]shared.Index, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetIndexes", ctx)
	ret0, _ := ret[0].([]shared.Index)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetIndexes indicates an expected call of GetIndexes.
func (mr *MockInstanceMockRecorder) GetIndexes(ctx interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetIndexes", reflect.TypeOf((*MockInstance)(nil).GetIndexes), ctx)
}

// GetMarkdown mocks base method.
func (m *MockInstance) GetMarkdown(ctx context.Context, service, path string) (*shared.Markdown, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetMarkdown", ctx, service, path)
	ret0, _ := ret[0].(*shared.Markdown)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetMarkdown indicates an expected call of GetMarkdown.
func (mr *MockInstanceMockRecorder) GetMarkdown(ctx, service, path interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetMarkdown", reflect.TypeOf((*MockInstance)(nil).GetMarkdown), ctx, service, path)
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
