package clusters

import (
	"context"

	"github.com/kobsio/kobs/pkg/api/plugins/clusters/cluster"
	clustersProto "github.com/kobsio/kobs/pkg/api/plugins/clusters/proto"

	"github.com/sirupsen/logrus"
)

// getTopology generates the topology for all applications. To generate the edges and nodes for the topology we have to
// get all applications accross al configured clusters. Then we add each application as node and each dependency of an
// application as edge to the topology.
// We also set a parent "cluster-namespace" for each application, so that we can group applications by cluster and
// namespace in the topology graph. The corresponding clusters and namespaces are added in the "GetApplicationsTopology"
// call
func getTopology(ctx context.Context, cs []*cluster.Cluster) Topology {
	log.Tracef("Fetch topology")

	var edges []*clustersProto.Edge
	var nodes []*clustersProto.Node

	for _, c := range cs {
		clusterName := c.GetName()

		applications, err := c.GetApplications(ctx, "")
		if err != nil {
			log.WithError(err).WithFields(logrus.Fields{"cluster": clusterName}).Errorf("Could not get applications")
			continue
		}

		for _, application := range applications {
			nodes = append(nodes, &clustersProto.Node{
				Id:        clusterName + "-" + application.Namespace + "-" + application.Name,
				Label:     application.Name,
				Type:      "application",
				Parent:    clusterName + "-" + application.Namespace,
				Cluster:   clusterName,
				Namespace: application.Namespace,
				Name:      application.Name,
			})

			for _, dependency := range application.Dependencies {
				dependencyCluster := dependency.Cluster
				if dependencyCluster == "" {
					dependencyCluster = application.Cluster
				}

				dependencyNamespace := dependency.Namespace
				if dependencyNamespace == "" {
					dependencyNamespace = application.Namespace
				}

				dependencyName := dependency.Name

				edges = append(edges, &clustersProto.Edge{
					Label:           application.Name + " → " + dependencyName,
					Type:            "dependency",
					Source:          clusterName + "-" + application.Namespace + "-" + application.Name,
					SourceCluster:   application.Cluster,
					SourceNamespace: application.Namespace,
					SourceName:      application.Name,
					Target:          dependencyCluster + "-" + dependencyNamespace + "-" + dependencyName,
					TargetCluster:   dependencyCluster,
					TargetNamespace: dependencyNamespace,
					TargetName:      dependencyName,
					Description:     dependency.Description,
				})
			}
		}
	}

	// Loop through all edges and remove the edge, when the source or target node doesn't exists. This is needed, so
	// that we only have edges were the source and target nodes exists, because the topology component in the React
	// UI will crash when it founds an edge but no corresponding node.
	var filterEdges []*clustersProto.Edge
	for _, edge := range edges {
		if doesNodeExists(nodes, edge.Source) && doesNodeExists(nodes, edge.Target) {
			filterEdges = append(filterEdges, edge)
		}
	}

	log.WithFields(logrus.Fields{"edges": len(filterEdges), "nodes": len(nodes)}).Tracef("Fetched topology")
	return Topology{
		edges: filterEdges,
		nodes: nodes,
	}
}

// appendEdgeIfMissing appends an edge to the list of edges, when is isn't already present in the list.
func appendEdgeIfMissing(edges []*clustersProto.Edge, edge *clustersProto.Edge) []*clustersProto.Edge {
	for _, ele := range edges {
		if ele.Label == edge.Label {
			return edges
		}
	}

	return append(edges, edge)
}

// appendNodeIfMissing appends a node to the list of nodes, when is isn't already present in the list.
func appendNodeIfMissing(nodes []*clustersProto.Node, node *clustersProto.Node) []*clustersProto.Node {
	for _, ele := range nodes {
		if ele.Id == node.Id {
			return nodes
		}
	}

	return append(nodes, node)
}

// doesNodeExists checks if the given node id exists in a slice of node.
func doesNodeExists(nodes []*clustersProto.Node, nodeID string) bool {
	for _, node := range nodes {
		if node.Id == nodeID {
			return true
		}
	}

	return false
}

// generateTopology generates the topology chart for the requested clusters and namespaces.
func generateTopology(topology Topology, clusters, namespaces []string) ([]*clustersProto.Edge, []*clustersProto.Node) {
	var edges []*clustersProto.Edge
	var nodes []*clustersProto.Node
	var clusterNodes []*clustersProto.Node
	var namespaceNodes []*clustersProto.Node

	for _, clusterName := range clusters {
		for _, namespace := range namespaces {
			for _, edge := range topology.edges {
				if (edge.SourceCluster == clusterName && edge.SourceNamespace == namespace) || (edge.TargetCluster == clusterName && edge.TargetNamespace == namespace) {
					edges = appendEdgeIfMissing(edges, edge)
				}
			}
		}
	}

	log.WithFields(logrus.Fields{"edges": edges}).Tracef("Edges")

	for _, edge := range edges {
		for _, node := range topology.nodes {
			if node.Id == edge.Source || node.Id == edge.Target {
				nodes = appendNodeIfMissing(nodes, node)

				clusterNode := &clustersProto.Node{
					Id:        node.Cluster,
					Label:     node.Cluster,
					Type:      "cluster",
					Parent:    "",
					Cluster:   node.Cluster,
					Namespace: "",
					Name:      "",
				}
				clusterNodes = appendNodeIfMissing(clusterNodes, clusterNode)

				namespaceNode := &clustersProto.Node{
					Id:        node.Cluster + "-" + node.Namespace,
					Label:     node.Namespace,
					Type:      "namespace",
					Parent:    node.Cluster,
					Cluster:   node.Cluster,
					Namespace: node.Namespace,
					Name:      "",
				}
				namespaceNodes = append(namespaceNodes, namespaceNode)
			}
		}
	}

	log.WithFields(logrus.Fields{"nodes": nodes, "cluster-nodes": clusterNodes, "namespace-nodes": namespaceNodes}).Tracef("Nodes")

	nodes = append(nodes, clusterNodes...)
	nodes = append(nodes, namespaceNodes...)

	return edges, nodes
}
