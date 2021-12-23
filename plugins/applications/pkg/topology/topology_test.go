package topology

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestDoesNodeExists(t *testing.T) {
	for _, tn := range []struct {
		nodes          []Node
		nodeID         string
		expectedExists bool
	}{
		{nodes: []Node{{Data: NodeData{ID: "node1"}}}, nodeID: "node1", expectedExists: true},
		{nodes: []Node{{Data: NodeData{ID: "node2"}}}, nodeID: "node1", expectedExists: false},
		{nodes: []Node{{Data: NodeData{ID: "node2"}}, {Data: NodeData{ID: "node2"}}}, nodeID: "node2", expectedExists: true},
	} {
		t.Run(tn.nodeID, func(t *testing.T) {
			actualExists := doesNodeExists(tn.nodes, tn.nodeID)
			require.Equal(t, tn.expectedExists, actualExists)
		})
	}
}

func TestAppendEdgeIfMissing(t *testing.T) {
	for _, te := range []struct {
		edges         []Edge
		edge          Edge
		expectedEdges []Edge
	}{
		{edges: []Edge{{Data: EdgeData{ID: "edge1"}}}, edge: Edge{Data: EdgeData{ID: "edge1"}}, expectedEdges: []Edge{{Data: EdgeData{ID: "edge1"}}}},
		{edges: []Edge{{Data: EdgeData{ID: "edge1"}}}, edge: Edge{Data: EdgeData{ID: "edge2"}}, expectedEdges: []Edge{{Data: EdgeData{ID: "edge1"}}, {Data: EdgeData{ID: "edge2"}}}},
	} {
		t.Run(te.edge.Data.ID, func(t *testing.T) {
			actualExists := appendEdgeIfMissing(te.edges, te.edge)
			require.Equal(t, te.expectedEdges, actualExists)
		})
	}
}

func TestAppendNodeIfMissing(t *testing.T) {
	for _, tn := range []struct {
		nodes         []Node
		node          Node
		expectedNodes []Node
	}{
		{nodes: []Node{{Data: NodeData{ID: "node1"}}}, node: Node{Data: NodeData{ID: "node1"}}, expectedNodes: []Node{{Data: NodeData{ID: "node1"}}}},
		{nodes: []Node{{Data: NodeData{ID: "node1"}}}, node: Node{Data: NodeData{ID: "node2"}}, expectedNodes: []Node{{Data: NodeData{ID: "node1"}}, {Data: NodeData{ID: "node2"}}}},
	} {
		t.Run(tn.node.Data.ID, func(t *testing.T) {
			actualExists := appendNodeIfMissing(tn.nodes, tn.node)
			require.Equal(t, tn.expectedNodes, actualExists)
		})
	}
}
