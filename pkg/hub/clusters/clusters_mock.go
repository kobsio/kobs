// Code generated by MockGen. DO NOT EDIT.
// Source: clusters.go

// Package clusters is a generated GoMock package.
package clusters

import (
	reflect "reflect"

	gomock "github.com/golang/mock/gomock"
	cluster "github.com/kobsio/kobs/pkg/hub/clusters/cluster"
)

// MockClient is a mock of Client interface.
type MockClient struct {
	ctrl     *gomock.Controller
	recorder *MockClientMockRecorder
}

// MockClientMockRecorder is the mock recorder for MockClient.
type MockClientMockRecorder struct {
	mock *MockClient
}

// NewMockClient creates a new mock instance.
func NewMockClient(ctrl *gomock.Controller) *MockClient {
	mock := &MockClient{ctrl: ctrl}
	mock.recorder = &MockClientMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use.
func (m *MockClient) EXPECT() *MockClientMockRecorder {
	return m.recorder
}

// GetCluster mocks base method.
func (m *MockClient) GetCluster(name string) cluster.Client {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetCluster", name)
	ret0, _ := ret[0].(cluster.Client)
	return ret0
}

// GetCluster indicates an expected call of GetCluster.
func (mr *MockClientMockRecorder) GetCluster(name interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetCluster", reflect.TypeOf((*MockClient)(nil).GetCluster), name)
}

// GetClusters mocks base method.
func (m *MockClient) GetClusters() []cluster.Client {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetClusters")
	ret0, _ := ret[0].([]cluster.Client)
	return ret0
}

// GetClusters indicates an expected call of GetClusters.
func (mr *MockClientMockRecorder) GetClusters() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetClusters", reflect.TypeOf((*MockClient)(nil).GetClusters))
}
