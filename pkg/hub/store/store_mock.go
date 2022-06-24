// Code generated by mockery v2.12.3. DO NOT EDIT.

package store

import (
	context "context"

	cluster "github.com/kobsio/kobs/pkg/kube/clusters/cluster"

	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"

	mock "github.com/stretchr/testify/mock"

	plugin "github.com/kobsio/kobs/pkg/satellite/plugins/plugin"

	shared "github.com/kobsio/kobs/pkg/hub/store/shared"

	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"

	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"

	v1 "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
)

// MockClient is an autogenerated mock type for the Client type
type MockClient struct {
	mock.Mock
}

// GetApplicationByID provides a mock function with given fields: ctx, id
func (_m *MockClient) GetApplicationByID(ctx context.Context, id string) (*v1.ApplicationSpec, error) {
	ret := _m.Called(ctx, id)

	var r0 *v1.ApplicationSpec
	if rf, ok := ret.Get(0).(func(context.Context, string) *v1.ApplicationSpec); ok {
		r0 = rf(ctx, id)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*v1.ApplicationSpec)
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

// GetApplications provides a mock function with given fields: ctx
func (_m *MockClient) GetApplications(ctx context.Context) ([]v1.ApplicationSpec, error) {
	ret := _m.Called(ctx)

	var r0 []v1.ApplicationSpec
	if rf, ok := ret.Get(0).(func(context.Context) []v1.ApplicationSpec); ok {
		r0 = rf(ctx)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]v1.ApplicationSpec)
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

// GetApplicationsByFilter provides a mock function with given fields: ctx, teams, clusterIDs, namespaceIDs, tags, searchTerm, external, limit, offset
func (_m *MockClient) GetApplicationsByFilter(ctx context.Context, teams []string, clusterIDs []string, namespaceIDs []string, tags []string, searchTerm string, external string, limit int, offset int) ([]v1.ApplicationSpec, error) {
	ret := _m.Called(ctx, teams, clusterIDs, namespaceIDs, tags, searchTerm, external, limit, offset)

	var r0 []v1.ApplicationSpec
	if rf, ok := ret.Get(0).(func(context.Context, []string, []string, []string, []string, string, string, int, int) []v1.ApplicationSpec); ok {
		r0 = rf(ctx, teams, clusterIDs, namespaceIDs, tags, searchTerm, external, limit, offset)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]v1.ApplicationSpec)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, []string, []string, []string, []string, string, string, int, int) error); ok {
		r1 = rf(ctx, teams, clusterIDs, namespaceIDs, tags, searchTerm, external, limit, offset)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetApplicationsByFilterCount provides a mock function with given fields: ctx, teams, clusterIDs, namespaceIDs, tags, searchTerm, external
func (_m *MockClient) GetApplicationsByFilterCount(ctx context.Context, teams []string, clusterIDs []string, namespaceIDs []string, tags []string, searchTerm string, external string) (int, error) {
	ret := _m.Called(ctx, teams, clusterIDs, namespaceIDs, tags, searchTerm, external)

	var r0 int
	if rf, ok := ret.Get(0).(func(context.Context, []string, []string, []string, []string, string, string) int); ok {
		r0 = rf(ctx, teams, clusterIDs, namespaceIDs, tags, searchTerm, external)
	} else {
		r0 = ret.Get(0).(int)
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, []string, []string, []string, []string, string, string) error); ok {
		r1 = rf(ctx, teams, clusterIDs, namespaceIDs, tags, searchTerm, external)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetCRDByID provides a mock function with given fields: ctx, id
func (_m *MockClient) GetCRDByID(ctx context.Context, id string) (*cluster.CRD, error) {
	ret := _m.Called(ctx, id)

	var r0 *cluster.CRD
	if rf, ok := ret.Get(0).(func(context.Context, string) *cluster.CRD); ok {
		r0 = rf(ctx, id)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*cluster.CRD)
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

// GetCRDs provides a mock function with given fields: ctx
func (_m *MockClient) GetCRDs(ctx context.Context) ([]cluster.CRD, error) {
	ret := _m.Called(ctx)

	var r0 []cluster.CRD
	if rf, ok := ret.Get(0).(func(context.Context) []cluster.CRD); ok {
		r0 = rf(ctx)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]cluster.CRD)
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

// GetClusters provides a mock function with given fields: ctx
func (_m *MockClient) GetClusters(ctx context.Context) ([]shared.Cluster, error) {
	ret := _m.Called(ctx)

	var r0 []shared.Cluster
	if rf, ok := ret.Get(0).(func(context.Context) []shared.Cluster); ok {
		r0 = rf(ctx)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]shared.Cluster)
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

// GetDashboardByID provides a mock function with given fields: ctx, id
func (_m *MockClient) GetDashboardByID(ctx context.Context, id string) (*dashboardv1.DashboardSpec, error) {
	ret := _m.Called(ctx, id)

	var r0 *dashboardv1.DashboardSpec
	if rf, ok := ret.Get(0).(func(context.Context, string) *dashboardv1.DashboardSpec); ok {
		r0 = rf(ctx, id)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*dashboardv1.DashboardSpec)
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

// GetDashboards provides a mock function with given fields: ctx
func (_m *MockClient) GetDashboards(ctx context.Context) ([]dashboardv1.DashboardSpec, error) {
	ret := _m.Called(ctx)

	var r0 []dashboardv1.DashboardSpec
	if rf, ok := ret.Get(0).(func(context.Context) []dashboardv1.DashboardSpec); ok {
		r0 = rf(ctx)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]dashboardv1.DashboardSpec)
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

// GetNamespaces provides a mock function with given fields: ctx
func (_m *MockClient) GetNamespaces(ctx context.Context) ([]shared.Namespace, error) {
	ret := _m.Called(ctx)

	var r0 []shared.Namespace
	if rf, ok := ret.Get(0).(func(context.Context) []shared.Namespace); ok {
		r0 = rf(ctx)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]shared.Namespace)
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

// GetNamespacesByClusterIDs provides a mock function with given fields: ctx, clusterIDs
func (_m *MockClient) GetNamespacesByClusterIDs(ctx context.Context, clusterIDs []string) ([]shared.Namespace, error) {
	ret := _m.Called(ctx, clusterIDs)

	var r0 []shared.Namespace
	if rf, ok := ret.Get(0).(func(context.Context, []string) []shared.Namespace); ok {
		r0 = rf(ctx, clusterIDs)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]shared.Namespace)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, []string) error); ok {
		r1 = rf(ctx, clusterIDs)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetPlugins provides a mock function with given fields: ctx
func (_m *MockClient) GetPlugins(ctx context.Context) ([]plugin.Instance, error) {
	ret := _m.Called(ctx)

	var r0 []plugin.Instance
	if rf, ok := ret.Get(0).(func(context.Context) []plugin.Instance); ok {
		r0 = rf(ctx)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]plugin.Instance)
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

// GetTags provides a mock function with given fields: ctx
func (_m *MockClient) GetTags(ctx context.Context) ([]shared.Tag, error) {
	ret := _m.Called(ctx)

	var r0 []shared.Tag
	if rf, ok := ret.Get(0).(func(context.Context) []shared.Tag); ok {
		r0 = rf(ctx)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]shared.Tag)
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

// GetTeamByGroup provides a mock function with given fields: ctx, group
func (_m *MockClient) GetTeamByGroup(ctx context.Context, group string) (*teamv1.TeamSpec, error) {
	ret := _m.Called(ctx, group)

	var r0 *teamv1.TeamSpec
	if rf, ok := ret.Get(0).(func(context.Context, string) *teamv1.TeamSpec); ok {
		r0 = rf(ctx, group)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*teamv1.TeamSpec)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, group)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetTeams provides a mock function with given fields: ctx
func (_m *MockClient) GetTeams(ctx context.Context) ([]teamv1.TeamSpec, error) {
	ret := _m.Called(ctx)

	var r0 []teamv1.TeamSpec
	if rf, ok := ret.Get(0).(func(context.Context) []teamv1.TeamSpec); ok {
		r0 = rf(ctx)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]teamv1.TeamSpec)
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

// GetTeamsByGroups provides a mock function with given fields: ctx, groups
func (_m *MockClient) GetTeamsByGroups(ctx context.Context, groups []string) ([]teamv1.TeamSpec, error) {
	ret := _m.Called(ctx, groups)

	var r0 []teamv1.TeamSpec
	if rf, ok := ret.Get(0).(func(context.Context, []string) []teamv1.TeamSpec); ok {
		r0 = rf(ctx, groups)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]teamv1.TeamSpec)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, []string) error); ok {
		r1 = rf(ctx, groups)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetTopologyByIDs provides a mock function with given fields: ctx, field, ids
func (_m *MockClient) GetTopologyByIDs(ctx context.Context, field string, ids []string) ([]shared.Topology, error) {
	ret := _m.Called(ctx, field, ids)

	var r0 []shared.Topology
	if rf, ok := ret.Get(0).(func(context.Context, string, []string) []shared.Topology); ok {
		r0 = rf(ctx, field, ids)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]shared.Topology)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string, []string) error); ok {
		r1 = rf(ctx, field, ids)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetUsers provides a mock function with given fields: ctx
func (_m *MockClient) GetUsers(ctx context.Context) ([]userv1.UserSpec, error) {
	ret := _m.Called(ctx)

	var r0 []userv1.UserSpec
	if rf, ok := ret.Get(0).(func(context.Context) []userv1.UserSpec); ok {
		r0 = rf(ctx)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]userv1.UserSpec)
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

// GetUsersByEmail provides a mock function with given fields: ctx, email
func (_m *MockClient) GetUsersByEmail(ctx context.Context, email string) ([]userv1.UserSpec, error) {
	ret := _m.Called(ctx, email)

	var r0 []userv1.UserSpec
	if rf, ok := ret.Get(0).(func(context.Context, string) []userv1.UserSpec); ok {
		r0 = rf(ctx, email)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]userv1.UserSpec)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, email)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// SaveApplications provides a mock function with given fields: ctx, satellite, applications
func (_m *MockClient) SaveApplications(ctx context.Context, satellite string, applications []v1.ApplicationSpec) error {
	ret := _m.Called(ctx, satellite, applications)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, string, []v1.ApplicationSpec) error); ok {
		r0 = rf(ctx, satellite, applications)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// SaveCRDs provides a mock function with given fields: ctx, crds
func (_m *MockClient) SaveCRDs(ctx context.Context, crds []cluster.CRD) error {
	ret := _m.Called(ctx, crds)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, []cluster.CRD) error); ok {
		r0 = rf(ctx, crds)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// SaveClusters provides a mock function with given fields: ctx, satellite, clusters
func (_m *MockClient) SaveClusters(ctx context.Context, satellite string, clusters []string) error {
	ret := _m.Called(ctx, satellite, clusters)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, string, []string) error); ok {
		r0 = rf(ctx, satellite, clusters)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// SaveDashboards provides a mock function with given fields: ctx, satellite, dashboards
func (_m *MockClient) SaveDashboards(ctx context.Context, satellite string, dashboards []dashboardv1.DashboardSpec) error {
	ret := _m.Called(ctx, satellite, dashboards)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, string, []dashboardv1.DashboardSpec) error); ok {
		r0 = rf(ctx, satellite, dashboards)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// SaveNamespaces provides a mock function with given fields: ctx, satellite, namespaces
func (_m *MockClient) SaveNamespaces(ctx context.Context, satellite string, namespaces map[string][]string) error {
	ret := _m.Called(ctx, satellite, namespaces)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, string, map[string][]string) error); ok {
		r0 = rf(ctx, satellite, namespaces)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// SavePlugins provides a mock function with given fields: ctx, satellite, plugins
func (_m *MockClient) SavePlugins(ctx context.Context, satellite string, plugins []plugin.Instance) error {
	ret := _m.Called(ctx, satellite, plugins)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, string, []plugin.Instance) error); ok {
		r0 = rf(ctx, satellite, plugins)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// SaveTags provides a mock function with given fields: ctx, applications
func (_m *MockClient) SaveTags(ctx context.Context, applications []v1.ApplicationSpec) error {
	ret := _m.Called(ctx, applications)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, []v1.ApplicationSpec) error); ok {
		r0 = rf(ctx, applications)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// SaveTeams provides a mock function with given fields: ctx, satellite, teams
func (_m *MockClient) SaveTeams(ctx context.Context, satellite string, teams []teamv1.TeamSpec) error {
	ret := _m.Called(ctx, satellite, teams)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, string, []teamv1.TeamSpec) error); ok {
		r0 = rf(ctx, satellite, teams)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// SaveTopology provides a mock function with given fields: ctx, satellite, applications
func (_m *MockClient) SaveTopology(ctx context.Context, satellite string, applications []v1.ApplicationSpec) error {
	ret := _m.Called(ctx, satellite, applications)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, string, []v1.ApplicationSpec) error); ok {
		r0 = rf(ctx, satellite, applications)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// SaveUsers provides a mock function with given fields: ctx, satellite, users
func (_m *MockClient) SaveUsers(ctx context.Context, satellite string, users []userv1.UserSpec) error {
	ret := _m.Called(ctx, satellite, users)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, string, []userv1.UserSpec) error); ok {
		r0 = rf(ctx, satellite, users)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

type NewMockClientT interface {
	mock.TestingT
	Cleanup(func())
}

// NewMockClient creates a new instance of MockClient. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
func NewMockClient(t NewMockClientT) *MockClient {
	mock := &MockClient{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}