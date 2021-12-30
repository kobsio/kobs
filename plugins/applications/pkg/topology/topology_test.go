package topology

import (
	"context"
	"fmt"
	"testing"

	application "github.com/kobsio/kobs/pkg/api/apis/application/v1beta1"
	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/clusters/cluster"

	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

var expectedGetTopology = Topology{
	Edges: []Edge{
		{Data: EdgeData{ID: "cluster1-namespace1-application1-cluster1-namespace1-application2", Source: "cluster1-namespace1-application1", SourceCluster: "cluster1", SourceNamespace: "namespace1", SourceName: "application1", Target: "cluster1-namespace1-application2", TargetCluster: "cluster1", TargetNamespace: "namespace1", TargetName: "application2"}},
		{Data: EdgeData{ID: "cluster1-namespace1-application2-cluster1-namespace2-application3", Source: "cluster1-namespace1-application2", SourceCluster: "cluster1", SourceNamespace: "namespace1", SourceName: "application2", Target: "cluster1-namespace2-application3", TargetCluster: "cluster1", TargetNamespace: "namespace2", TargetName: "application3"}},
		{Data: EdgeData{ID: "cluster1-namespace2-application3-cluster2-namespace3-application4", Source: "cluster1-namespace2-application3", SourceCluster: "cluster1", SourceNamespace: "namespace2", SourceName: "application3", Target: "cluster2-namespace3-application4", TargetCluster: "cluster2", TargetNamespace: "namespace3", TargetName: "application4"}},
		{Data: EdgeData{ID: "cluster1-namespace2-application3-cluster2-namespace3-application5", Source: "cluster1-namespace2-application3", SourceCluster: "cluster1", SourceNamespace: "namespace2", SourceName: "application3", Target: "cluster2-namespace3-application5", TargetCluster: "cluster2", TargetNamespace: "namespace3", TargetName: "application5"}},
	},
	Nodes: []Node{
		{Data: NodeData{ID: "cluster1-namespace1-application1", Type: "application", Label: "application1", Parent: "cluster1-namespace1", ApplicationSpec: application.ApplicationSpec{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Topology: application.Topology{Type: "application", Dependencies: []application.Dependency{{Cluster: "", Namespace: "", Name: "application2"}}}}}},
		{Data: NodeData{ID: "cluster1-namespace1-application2", Type: "application", Label: "application2", Parent: "cluster1-namespace1", ApplicationSpec: application.ApplicationSpec{Cluster: "cluster1", Namespace: "namespace1", Name: "application2", Topology: application.Topology{Type: "application", Dependencies: []application.Dependency{{Cluster: "", Namespace: "namespace2", Name: "application3"}}}}}},
		{Data: NodeData{ID: "cluster1-namespace2-application3", Type: "application", Label: "application3", Parent: "cluster1-namespace2", ApplicationSpec: application.ApplicationSpec{Cluster: "cluster1", Namespace: "namespace2", Name: "application3", Topology: application.Topology{Type: "application", Dependencies: []application.Dependency{{Cluster: "cluster2", Namespace: "namespace3", Name: "application4"}, {Cluster: "cluster2", Namespace: "namespace3", Name: "application5"}}}}}},
		{Data: NodeData{ID: "cluster2-namespace3-application4", Type: "application", Label: "application4", Parent: "cluster2-namespace3", ApplicationSpec: application.ApplicationSpec{Cluster: "cluster2", Namespace: "namespace3", Name: "application4", Topology: application.Topology{Type: "application"}}}},
		{Data: NodeData{ID: "cluster2-namespace3-application5", Type: "application", Label: "application5", Parent: "cluster2-namespace3", ApplicationSpec: application.ApplicationSpec{Cluster: "cluster2", Namespace: "namespace3", Name: "application5", Topology: application.Topology{Type: "application"}}}},
	},
}

var expectedGenerateTopology = Topology{
	Edges: []Edge{
		{Data: EdgeData{ID: "cluster1-namespace1-application1-cluster1-namespace1-application2", Source: "cluster1-namespace1-application1", SourceCluster: "cluster1", SourceNamespace: "namespace1", SourceName: "application1", Target: "cluster1-namespace1-application2", TargetCluster: "cluster1", TargetNamespace: "namespace1", TargetName: "application2"}},
		{Data: EdgeData{ID: "cluster1-namespace1-application2-cluster1-namespace2-application3", Source: "cluster1-namespace1-application2", SourceCluster: "cluster1", SourceNamespace: "namespace1", SourceName: "application2", Target: "cluster1-namespace2-application3", TargetCluster: "cluster1", TargetNamespace: "namespace2", TargetName: "application3"}},
		{Data: EdgeData{ID: "cluster1-namespace2-application3-cluster2-namespace3-application4", Source: "cluster1-namespace2-application3", SourceCluster: "cluster1", SourceNamespace: "namespace2", SourceName: "application3", Target: "cluster2-namespace3-application4", TargetCluster: "cluster2", TargetNamespace: "namespace3", TargetName: "application4"}},
		{Data: EdgeData{ID: "cluster1-namespace2-application3-cluster2-namespace3-application5", Source: "cluster1-namespace2-application3", SourceCluster: "cluster1", SourceNamespace: "namespace2", SourceName: "application3", Target: "cluster2-namespace3-application5", TargetCluster: "cluster2", TargetNamespace: "namespace3", TargetName: "application5"}},
	},
	Nodes: []Node{
		{Data: NodeData{ID: "cluster1-namespace1-application1", Type: "application", Label: "application1", Parent: "cluster1-namespace1", ApplicationSpec: application.ApplicationSpec{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Topology: application.Topology{Type: "application", Dependencies: []application.Dependency{{Cluster: "", Namespace: "", Name: "application2"}}}}}},
		{Data: NodeData{ID: "cluster1-namespace1-application2", Type: "application", Label: "application2", Parent: "cluster1-namespace1", ApplicationSpec: application.ApplicationSpec{Cluster: "cluster1", Namespace: "namespace1", Name: "application2", Topology: application.Topology{Type: "application", Dependencies: []application.Dependency{{Cluster: "", Namespace: "namespace2", Name: "application3"}}}}}},
		{Data: NodeData{ID: "cluster1-namespace2-application3", Type: "application", Label: "application3", Parent: "cluster1-namespace2", ApplicationSpec: application.ApplicationSpec{Cluster: "cluster1", Namespace: "namespace2", Name: "application3", Topology: application.Topology{Type: "application", Dependencies: []application.Dependency{{Cluster: "cluster2", Namespace: "namespace3", Name: "application4"}, {Cluster: "cluster2", Namespace: "namespace3", Name: "application5"}}}}}},
		{Data: NodeData{ID: "cluster2-namespace3-application4", Type: "application", Label: "application4", Parent: "cluster2-namespace3", ApplicationSpec: application.ApplicationSpec{Cluster: "cluster2", Namespace: "namespace3", Name: "application4", Topology: application.Topology{Type: "application"}}}},
		{Data: NodeData{ID: "cluster2-namespace3-application5", Type: "application", Label: "application5", Parent: "cluster2-namespace3", ApplicationSpec: application.ApplicationSpec{Cluster: "cluster2", Namespace: "namespace3", Name: "application5", Topology: application.Topology{Type: "application"}}}},
		{Data: NodeData{ID: "cluster1", Type: "cluster", Label: "cluster1", Parent: "", ApplicationSpec: application.ApplicationSpec{Cluster: "", Namespace: "", Name: ""}}},
		{Data: NodeData{ID: "cluster2", Type: "cluster", Label: "cluster2", Parent: "", ApplicationSpec: application.ApplicationSpec{Cluster: "", Namespace: "", Name: ""}}},
		{Data: NodeData{ID: "cluster1-namespace1", Type: "namespace", Label: "namespace1", Parent: "cluster1", ApplicationSpec: application.ApplicationSpec{Cluster: "", Namespace: "", Name: ""}}},
		{Data: NodeData{ID: "cluster1-namespace1", Type: "namespace", Label: "namespace1", Parent: "cluster1", ApplicationSpec: application.ApplicationSpec{Cluster: "", Namespace: "", Name: ""}}},
		{Data: NodeData{ID: "cluster1-namespace1", Type: "namespace", Label: "namespace1", Parent: "cluster1", ApplicationSpec: application.ApplicationSpec{Cluster: "", Namespace: "", Name: ""}}},
		{Data: NodeData{ID: "cluster1-namespace2", Type: "namespace", Label: "namespace2", Parent: "cluster1", ApplicationSpec: application.ApplicationSpec{Cluster: "", Namespace: "", Name: ""}}},
		{Data: NodeData{ID: "cluster1-namespace2", Type: "namespace", Label: "namespace2", Parent: "cluster1", ApplicationSpec: application.ApplicationSpec{Cluster: "", Namespace: "", Name: ""}}},
		{Data: NodeData{ID: "cluster2-namespace3", Type: "namespace", Label: "namespace3", Parent: "cluster2", ApplicationSpec: application.ApplicationSpec{Cluster: "", Namespace: "", Name: ""}}},
		{Data: NodeData{ID: "cluster1-namespace2", Type: "namespace", Label: "namespace2", Parent: "cluster1", ApplicationSpec: application.ApplicationSpec{Cluster: "", Namespace: "", Name: ""}}},
		{Data: NodeData{ID: "cluster2-namespace3", Type: "namespace", Label: "namespace3", Parent: "cluster2", ApplicationSpec: application.ApplicationSpec{Cluster: "", Namespace: "", Name: ""}}},
	},
}

func TestGet(t *testing.T) {
	mockClusterClient := &cluster.MockClient{}
	mockClusterClient.AssertExpectations(t)
	mockClusterClient.On("GetName").Return("cluster")

	mockClustersClient := &clusters.MockClient{}
	mockClustersClient.AssertExpectations(t)
	mockClustersClient.On("GetClusters").Return([]cluster.Client{mockClusterClient})

	t.Run("get applications error", func(t *testing.T) {
		mockClusterClient.On("GetApplications", mock.Anything, "").Return(nil, fmt.Errorf("could not get teams")).Once()
		teams := Get(context.Background(), mockClustersClient)
		require.Empty(t, teams)
	})

	t.Run("get topology", func(t *testing.T) {
		mockClusterClient.On("GetApplications", mock.Anything, "").Return([]application.ApplicationSpec{
			{Cluster: "cluster1", Namespace: "namespace1", Name: "application1", Topology: application.Topology{Type: "application", Dependencies: []application.Dependency{{Cluster: "", Namespace: "", Name: "application2"}}}},
			{Cluster: "cluster1", Namespace: "namespace1", Name: "application2", Topology: application.Topology{Type: "application", Dependencies: []application.Dependency{{Cluster: "", Namespace: "namespace2", Name: "application3"}}}},
			{Cluster: "cluster1", Namespace: "namespace2", Name: "application3", Topology: application.Topology{Type: "application", Dependencies: []application.Dependency{{Cluster: "cluster2", Namespace: "namespace3", Name: "application4"}, {Cluster: "cluster2", Namespace: "namespace3", Name: "application5"}}}},
			{Cluster: "cluster2", Namespace: "namespace3", Name: "application4", Topology: application.Topology{Type: "application"}},
			{Cluster: "cluster2", Namespace: "namespace3", Name: "application5", Topology: application.Topology{Type: "application"}},
		}, nil).Once()
		actualTopology := Get(context.Background(), mockClustersClient)
		require.Equal(t, &expectedGetTopology, actualTopology)
	})
}

func TestGenerate(t *testing.T) {
	actualTopology1 := Generate(&expectedGetTopology, []string{"cluster1", "cluster2"}, []string{"namespace1", "namespace2", "namespace3"}, nil)
	require.Equal(t, &expectedGenerateTopology, actualTopology1)

	actualTopology2 := Generate(&expectedGetTopology, []string{"cluster1", "cluster2"}, nil, nil)
	require.Equal(t, &expectedGenerateTopology, actualTopology2)
}

func TestDoesNodeExists(t *testing.T) {
	for _, tt := range []struct {
		nodes          []Node
		nodeID         string
		expectedExists bool
	}{
		{nodes: []Node{{Data: NodeData{ID: "node1"}}}, nodeID: "node1", expectedExists: true},
		{nodes: []Node{{Data: NodeData{ID: "node2"}}}, nodeID: "node1", expectedExists: false},
		{nodes: []Node{{Data: NodeData{ID: "node2"}}, {Data: NodeData{ID: "node2"}}}, nodeID: "node2", expectedExists: true},
	} {
		t.Run(tt.nodeID, func(t *testing.T) {
			actualExists := doesNodeExists(tt.nodes, tt.nodeID)
			require.Equal(t, tt.expectedExists, actualExists)
		})
	}
}

func TestAppendEdgeIfMissing(t *testing.T) {
	for _, tt := range []struct {
		edges         []Edge
		edge          Edge
		expectedEdges []Edge
	}{
		{edges: []Edge{{Data: EdgeData{ID: "edge1"}}}, edge: Edge{Data: EdgeData{ID: "edge1"}}, expectedEdges: []Edge{{Data: EdgeData{ID: "edge1"}}}},
		{edges: []Edge{{Data: EdgeData{ID: "edge1"}}}, edge: Edge{Data: EdgeData{ID: "edge2"}}, expectedEdges: []Edge{{Data: EdgeData{ID: "edge1"}}, {Data: EdgeData{ID: "edge2"}}}},
	} {
		t.Run(tt.edge.Data.ID, func(t *testing.T) {
			actualExists := appendEdgeIfMissing(tt.edges, tt.edge)
			require.Equal(t, tt.expectedEdges, actualExists)
		})
	}
}

func TestAppendNodeIfMissing(t *testing.T) {
	for _, tt := range []struct {
		nodes         []Node
		node          Node
		expectedNodes []Node
	}{
		{nodes: []Node{{Data: NodeData{ID: "node1"}}}, node: Node{Data: NodeData{ID: "node1"}}, expectedNodes: []Node{{Data: NodeData{ID: "node1"}}}},
		{nodes: []Node{{Data: NodeData{ID: "node1"}}}, node: Node{Data: NodeData{ID: "node2"}}, expectedNodes: []Node{{Data: NodeData{ID: "node1"}}, {Data: NodeData{ID: "node2"}}}},
	} {
		t.Run(tt.node.Data.ID, func(t *testing.T) {
			actualExists := appendNodeIfMissing(tt.nodes, tt.node)
			require.Equal(t, tt.expectedNodes, actualExists)
		})
	}
}

func TestGetNodeType(t *testing.T) {
	require.Equal(t, "type1", getNodeTyp(Node{Data: NodeData{"id1", "type1", "name1", "parent", application.ApplicationSpec{Namespace: "namespace1", Tags: []string{"tag1"}}}}, nil, nil))
	require.Equal(t, "type1", getNodeTyp(Node{Data: NodeData{"id1", "type1", "name1", "parent", application.ApplicationSpec{Namespace: "namespace1", Tags: []string{"tag1"}}}}, nil, []string{"tag1", "tag2"}))
	require.Equal(t, "type1", getNodeTyp(Node{Data: NodeData{"id1", "type1", "name1", "parent", application.ApplicationSpec{Namespace: "namespace1", Tags: []string{"tag1"}}}}, []string{"namespace1", "namespace2"}, nil))
	require.Equal(t, "type1", getNodeTyp(Node{Data: NodeData{"id1", "type1", "name1", "parent", application.ApplicationSpec{Namespace: "namespace3", Tags: []string{"tag1"}}}}, []string{"namespace1", "namespace2"}, []string{"tag1", "tag2"}))
	require.Equal(t, "type1-not-selected", getNodeTyp(Node{Data: NodeData{"id1", "type1", "name1", "parent", application.ApplicationSpec{Namespace: "namespace3", Tags: []string{"tag3"}}}}, []string{"namespace1", "namespace2"}, []string{"tag1", "tag2"}))
}

func TestIsItemsInItems(t *testing.T) {
	require.Equal(t, true, isItemsInItems([]string{"namespace2", "namespace3"}, []string{"namespace1", "namespace2", "namespace3"}))
	require.Equal(t, false, isItemsInItems([]string{"namespace4", "namespace5"}, []string{"namespace1", "namespace2", "namespace3"}))
}

func TestIsItemInItems(t *testing.T) {
	require.Equal(t, true, isItemInItems("namespace1", []string{"namespace1", "namespace2", "namespace3"}))
	require.Equal(t, false, isItemInItems("namespace4", []string{"namespace1", "namespace2", "namespace3"}))
}
