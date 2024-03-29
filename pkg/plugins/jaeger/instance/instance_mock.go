// Code generated by MockGen. DO NOT EDIT.
// Source: instance.go

// Package instance is a generated GoMock package.
package instance

import (
	context "context"
	http "net/http"
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

// GetMetrics mocks base method.
func (m *MockInstance) GetMetrics(ctx context.Context, w http.ResponseWriter, metric, service, groupByOperation, quantile, ratePer, step string, spanKinds []string, timeStart, timeEnd int64) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetMetrics", ctx, w, metric, service, groupByOperation, quantile, ratePer, step, spanKinds, timeStart, timeEnd)
	ret0, _ := ret[0].(error)
	return ret0
}

// GetMetrics indicates an expected call of GetMetrics.
func (mr *MockInstanceMockRecorder) GetMetrics(ctx, w, metric, service, groupByOperation, quantile, ratePer, step, spanKinds, timeStart, timeEnd interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetMetrics", reflect.TypeOf((*MockInstance)(nil).GetMetrics), ctx, w, metric, service, groupByOperation, quantile, ratePer, step, spanKinds, timeStart, timeEnd)
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

// GetOperations mocks base method.
func (m *MockInstance) GetOperations(ctx context.Context, w http.ResponseWriter, service string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetOperations", ctx, w, service)
	ret0, _ := ret[0].(error)
	return ret0
}

// GetOperations indicates an expected call of GetOperations.
func (mr *MockInstanceMockRecorder) GetOperations(ctx, w, service interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetOperations", reflect.TypeOf((*MockInstance)(nil).GetOperations), ctx, w, service)
}

// GetServices mocks base method.
func (m *MockInstance) GetServices(ctx context.Context, w http.ResponseWriter) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetServices", ctx, w)
	ret0, _ := ret[0].(error)
	return ret0
}

// GetServices indicates an expected call of GetServices.
func (mr *MockInstanceMockRecorder) GetServices(ctx, w interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetServices", reflect.TypeOf((*MockInstance)(nil).GetServices), ctx, w)
}

// GetTrace mocks base method.
func (m *MockInstance) GetTrace(ctx context.Context, w http.ResponseWriter, traceID string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetTrace", ctx, w, traceID)
	ret0, _ := ret[0].(error)
	return ret0
}

// GetTrace indicates an expected call of GetTrace.
func (mr *MockInstanceMockRecorder) GetTrace(ctx, w, traceID interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetTrace", reflect.TypeOf((*MockInstance)(nil).GetTrace), ctx, w, traceID)
}

// GetTraces mocks base method.
func (m *MockInstance) GetTraces(ctx context.Context, w http.ResponseWriter, limit, maxDuration, minDuration, operation, service, tags string, timeStart, timeEnd int64) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetTraces", ctx, w, limit, maxDuration, minDuration, operation, service, tags, timeStart, timeEnd)
	ret0, _ := ret[0].(error)
	return ret0
}

// GetTraces indicates an expected call of GetTraces.
func (mr *MockInstanceMockRecorder) GetTraces(ctx, w, limit, maxDuration, minDuration, operation, service, tags, timeStart, timeEnd interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetTraces", reflect.TypeOf((*MockInstance)(nil).GetTraces), ctx, w, limit, maxDuration, minDuration, operation, service, tags, timeStart, timeEnd)
}

// doRequest mocks base method.
func (m *MockInstance) doRequest(ctx context.Context, w http.ResponseWriter, url string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "doRequest", ctx, w, url)
	ret0, _ := ret[0].(error)
	return ret0
}

// doRequest indicates an expected call of doRequest.
func (mr *MockInstanceMockRecorder) doRequest(ctx, w, url interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "doRequest", reflect.TypeOf((*MockInstance)(nil).doRequest), ctx, w, url)
}
