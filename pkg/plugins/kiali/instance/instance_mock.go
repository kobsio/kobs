// Code generated by MockGen. DO NOT EDIT.
// Source: instance.go

// Package instance is a generated GoMock package.
package instance

import (
	context "context"
	reflect "reflect"

	gomock "github.com/golang/mock/gomock"
	models "github.com/kiali/kiali/models"
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

// GetApplicationGraph mocks base method.
func (m *MockInstance) GetApplicationGraph(ctx context.Context, namespace, application string, duration int64, graphType, groupBy string, injectServiceNodes bool, appenders []string) (*Graph, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetApplicationGraph", ctx, namespace, application, duration, graphType, groupBy, injectServiceNodes, appenders)
	ret0, _ := ret[0].(*Graph)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetApplicationGraph indicates an expected call of GetApplicationGraph.
func (mr *MockInstanceMockRecorder) GetApplicationGraph(ctx, namespace, application, duration, graphType, groupBy, injectServiceNodes, appenders interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetApplicationGraph", reflect.TypeOf((*MockInstance)(nil).GetApplicationGraph), ctx, namespace, application, duration, graphType, groupBy, injectServiceNodes, appenders)
}

// GetGraph mocks base method.
func (m *MockInstance) GetGraph(ctx context.Context, duration int64, graphType, groupBy string, injectServiceNodes bool, appenders, namespaces []string) (*Graph, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetGraph", ctx, duration, graphType, groupBy, injectServiceNodes, appenders, namespaces)
	ret0, _ := ret[0].(*Graph)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetGraph indicates an expected call of GetGraph.
func (mr *MockInstanceMockRecorder) GetGraph(ctx, duration, graphType, groupBy, injectServiceNodes, appenders, namespaces interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetGraph", reflect.TypeOf((*MockInstance)(nil).GetGraph), ctx, duration, graphType, groupBy, injectServiceNodes, appenders, namespaces)
}

// GetMetrics mocks base method.
func (m *MockInstance) GetMetrics(ctx context.Context, url string) (*map[string]any, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetMetrics", ctx, url)
	ret0, _ := ret[0].(*map[string]any)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetMetrics indicates an expected call of GetMetrics.
func (mr *MockInstanceMockRecorder) GetMetrics(ctx, url interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetMetrics", reflect.TypeOf((*MockInstance)(nil).GetMetrics), ctx, url)
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

// GetNamespaces mocks base method.
func (m *MockInstance) GetNamespaces(ctx context.Context) ([]models.Namespace, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetNamespaces", ctx)
	ret0, _ := ret[0].([]models.Namespace)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetNamespaces indicates an expected call of GetNamespaces.
func (mr *MockInstanceMockRecorder) GetNamespaces(ctx interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetNamespaces", reflect.TypeOf((*MockInstance)(nil).GetNamespaces), ctx)
}
