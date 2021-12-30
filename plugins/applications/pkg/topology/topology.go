package topology

import (
	"context"
	"time"

	application "github.com/kobsio/kobs/pkg/api/apis/application/v1beta1"
	dashboard "github.com/kobsio/kobs/pkg/api/apis/dashboard/v1beta1"
	"github.com/kobsio/kobs/pkg/api/clusters"
)

// Config is the structure of the topology graph configuration. It contains a type which can then be used in the
// "topology.type" property in an application. It also contains a user color and shape which defines how the application
// is rendered in the topology graph.
type Config struct {
	Type  string `json:"type"`
	Shape string `json:"shape"`
	Color string `json:"color"`
}

// Cache is the structure which can be used to cache the generated topology graph in the applications plugin.
type Cache struct {
	LastFetch     time.Time
	CacheDuration time.Duration
	Topology      *Topology
}

// Topology is the structure of the topology graph. The topology contains a list of nodes (applications, namespaces and
// clusters) and a list of edges, which are defined by the dependencies field in the Applications CR.
type Topology struct {
	Edges []Edge `json:"edges"`
	Nodes []Node `json:"nodes"`
}

// Node is the structure for a node in the topology graph.
type Node struct {
	Data NodeData `json:"data"`
}

// NodeData is the data for a node. Each node must contain a unique id, type (application, namespace, cluster) a label
// and a parent. Each application node has a namespace nodes as parent and each namespace has a cluster as parent.
type NodeData struct {
	ID     string `json:"id"`
	Type   string `json:"type"`
	Label  string `json:"label"`
	Parent string `json:"parent"`
	application.ApplicationSpec
}

// Edge is the structure for a edge in the topology graph.
type Edge struct {
	Data EdgeData `json:"data"`
}

// EdgeData is the data for a edge. Each edge must contain a unique id a source and a target. Where the source and
// target is a reference to the id of a node. Each edge also contains the cluster, namespace and name of the source and
// target and an optional description, which can be used to describe the relationship between the source and target.
type EdgeData struct {
	ID              string                `json:"id"`
	Source          string                `json:"source"`
	SourceCluster   string                `json:"-"`
	SourceNamespace string                `json:"-"`
	SourceName      string                `json:"-"`
	Target          string                `json:"target"`
	TargetCluster   string                `json:"-"`
	TargetNamespace string                `json:"-"`
	TargetName      string                `json:"-"`
	Description     string                `json:"description"`
	Dashboards      []dashboard.Reference `json:"dashboards"`
}

// Get returnes the topology graph for all the configured clusters. To generate the topology chart we have to loop
// through all clusters and get all applications for all clusters. Then we are going through all the applications and
// and add them as node in the topology grahp. The defined dependencies for all applications are added as edges in the
// topology.
func Get(ctx context.Context, clustersClient clusters.Client) *Topology {
	var edges []Edge
	var nodes []Node

	for _, c := range clustersClient.GetClusters() {
		applications, err := c.GetApplications(ctx, "")
		if err != nil {
			continue
		}

		for _, application := range applications {
			parent := application.Cluster + "-" + application.Namespace
			if application.Topology.External {
				parent = ""
			}

			nodes = append(nodes, Node{
				Data: NodeData{
					application.Cluster + "-" + application.Namespace + "-" + application.Name,
					application.Topology.Type,
					application.Name,
					parent,
					application,
				},
			})

			// The cluster and namespace field in the reference for a dependency is optional. So that we have to set the
			// cluster and namespace to the cluster and namespace of the current application, when it isn't defined in
			// the dependency reference.
			for _, dependency := range application.Topology.Dependencies {
				dependencyCluster := dependency.Cluster
				if dependencyCluster == "" {
					dependencyCluster = application.Cluster
				}

				dependencyNamespace := dependency.Namespace
				if dependencyNamespace == "" {
					dependencyNamespace = application.Namespace
				}

				dependencyName := dependency.Name

				edges = append(edges, Edge{
					Data: EdgeData{
						ID:              application.Cluster + "-" + application.Namespace + "-" + application.Name + "-" + dependencyCluster + "-" + dependencyNamespace + "-" + dependencyName,
						Source:          application.Cluster + "-" + application.Namespace + "-" + application.Name,
						SourceCluster:   application.Cluster,
						SourceNamespace: application.Namespace,
						SourceName:      application.Name,
						Target:          dependencyCluster + "-" + dependencyNamespace + "-" + dependencyName,
						TargetCluster:   dependencyCluster,
						TargetNamespace: dependencyNamespace,
						TargetName:      dependencyName,
						Description:     dependency.Description,
						Dashboards:      dependency.Dashboards,
					},
				})
			}
		}
	}

	// Loop through all edges and remove the edge, when the source or target node doesn't exists. This is needed, so
	// that we only have edges were the source and target nodes exists, because the topology component in the React
	// UI will crash when it founds an edge but no corresponding node.
	var filterEdges []Edge
	for _, edge := range edges {
		if doesNodeExists(nodes, edge.Data.Source) && doesNodeExists(nodes, edge.Data.Target) {
			filterEdges = append(filterEdges, edge)
		}
	}

	return &Topology{
		Edges: filterEdges,
		Nodes: nodes,
	}
}

// Generate is used to generate the topology chart for the users selected clusters and namespace. To generate this part
// of the topology graph we are going through all given clusters and namespace and add all the edges which are
// containing the given cluster/namespace as source or target. After that we are looping through all the edges and we
// are adding the source and target nodes. We are also creating an additional slice for the cluster and namespace nodes,
// which are then merged with the nodes slice. This is necessary, because we do not save the clusters and namespaces as
// nodes in the cached topology.
func Generate(topology *Topology, clusters, namespaces, tags []string) *Topology {
	var edges []Edge
	var nodes []Node
	var clusterNodes []Node
	var namespaceNodes []Node

	for _, clusterName := range clusters {
		if namespaces == nil {
			for _, edge := range topology.Edges {
				if (edge.Data.SourceCluster == clusterName) || (edge.Data.TargetCluster == clusterName) {
					edges = appendEdgeIfMissing(edges, edge)
				}
			}
		} else {
			for _, namespace := range namespaces {
				for _, edge := range topology.Edges {
					if (edge.Data.SourceCluster == clusterName && edge.Data.SourceNamespace == namespace) || (edge.Data.TargetCluster == clusterName && edge.Data.TargetNamespace == namespace) {
						edges = appendEdgeIfMissing(edges, edge)
					}
				}
			}
		}
	}

	for _, edge := range edges {
		for _, node := range topology.Nodes {
			if node.Data.ID == edge.Data.Source || node.Data.ID == edge.Data.Target {
				node.Data.Type = getNodeTyp(node, namespaces, tags)
				nodes = appendNodeIfMissing(nodes, node)

				clusterNode := Node{
					Data: NodeData{
						ID:     node.Data.Cluster,
						Type:   "cluster",
						Label:  node.Data.Cluster,
						Parent: "",
					},
				}
				clusterNodes = appendNodeIfMissing(clusterNodes, clusterNode)

				namespaceNode := Node{
					Data: NodeData{
						ID:     node.Data.Cluster + "-" + node.Data.Namespace,
						Type:   "namespace",
						Label:  node.Data.Namespace,
						Parent: node.Data.Cluster,
					},
				}
				namespaceNodes = append(namespaceNodes, namespaceNode)
			}
		}
	}

	nodes = append(nodes, clusterNodes...)
	nodes = append(nodes, namespaceNodes...)

	return &Topology{
		Edges: edges,
		Nodes: nodes,
	}
}

// doesNodeExists checks if the given node id exists in a slice of node.
func doesNodeExists(nodes []Node, nodeID string) bool {
	for _, node := range nodes {
		if node.Data.ID == nodeID {
			return true
		}
	}

	return false
}

// appendEdgeIfMissing appends an edge to the list of edges, when is isn't already present in the list.
func appendEdgeIfMissing(edges []Edge, edge Edge) []Edge {
	for _, ele := range edges {
		if ele.Data.ID == edge.Data.ID {
			return edges
		}
	}

	return append(edges, edge)
}

// appendNodeIfMissing appends a node to the list of nodes, when is isn't already present in the list.
func appendNodeIfMissing(nodes []Node, node Node) []Node {
	for _, ele := range nodes {
		if ele.Data.ID == node.Data.ID {
			return nodes
		}
	}

	return append(nodes, node)
}

// getNodeTyp returns the correct node type for a node in the topology graph. This is required, because we only filter
// the topology graph by the selected namespaces and not tags. To apply a different style for node which are outside of
// the selected namespaces or for nodes which are not containing a tag. To change the style we add the "-not-selected"
// suffix. The following rules are applied:
//   - No namespaces and tags were selected -- NORMAL
//   - The node contains a selected tag --> NORMAL
//   - The node is within a selected namespaces and the user didn't selected any tags --> NORMAL
//   - Node is in the list of selected namespaces but not in the list of selected tags --> WITH SUFFIX
//   - Node is not in the list of selected namespaces and tags --> SUFFIX
func getNodeTyp(node Node, namespaces, tags []string) string {
	if namespaces == nil && tags == nil {
		return node.Data.Type
	}

	isInNamespace := isItemInItems(node.Data.Namespace, namespaces)
	containsTag := isItemsInItems(node.Data.Tags, tags)

	if containsTag {
		return node.Data.Type
	}

	if tags == nil && isInNamespace {
		return node.Data.Type
	}

	return node.Data.Type + "-not-selected"
}

// isItemsInItems return true, when one item from a list of actual items is in a list of expected items.
func isItemsInItems(itemsActual, itemExpected []string) bool {
	for _, tag := range itemsActual {
		if isItemInItems(tag, itemExpected) {
			return true
		}
	}

	return false
}

// isItemInItems returns true when the item is in a list of items.
func isItemInItems(item string, items []string) bool {
	for _, i := range items {
		if i == item {
			return true
		}
	}

	return false
}
