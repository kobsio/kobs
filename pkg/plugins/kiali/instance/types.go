package instance

import (
	"github.com/kiali/kiali/graph/config/cytoscape"
)

// ResponseError is the structure for a failed Harbor API request.
type ResponseError struct {
	Errors []struct {
		Code    string `json:"code"`
		Message string `json:"message"`
	} `json:"errors"`
}

// Traffic is the traffic configuration, to set the value to mark a edge as degraded and failure.
type Traffic struct {
	Degraded float64 `json:"degraded"`
	Failure  float64 `json:"failure"`
}

// Graph is the structure of the returned topology graph from Kiali. We have to implement it by ourselve, because we
// have to add some additional fields, which are required by the React UI.
type Graph struct {
	Elements *Elements `json:"elements"`
}

// Elements is the https://pkg.go.dev/github.com/kiali/kiali@v1.37.0/graph/config/cytoscape#Elements struct.
type Elements struct {
	Nodes []*NodeWrapper `json:"nodes"`
	Edges []*EdgeWrapper `json:"edges"`
}

// NodeWrapper is the https://pkg.go.dev/github.com/kiali/kiali@v1.37.0/graph/config/cytoscape#NodeWrapper struct.
type NodeWrapper struct {
	Data *NodeData `json:"data"`
}

// NodeData is the https://pkg.go.dev/github.com/kiali/kiali@v1.37.0/graph/config/cytoscape#NodeData struct plus our
// additional fields.
type NodeData struct {
	cytoscape.NodeData

	NodeLabel     string `json:"nodeLabel"`
	NodeLabelFull string `json:"nodeLabelFull"`
	NodeImage     string `json:"nodeImage"`
}

// EdgeWrapper is the https://pkg.go.dev/github.com/kiali/kiali@v1.37.0/graph/config/cytoscape#EdgeWrapper struct.
type EdgeWrapper struct {
	Data *EdgeData `json:"data"`
}

// EdgeData is the https://pkg.go.dev/github.com/kiali/kiali@v1.37.0/graph/config/cytoscape#EdgeData struct plus our
// additional fields.
type EdgeData struct {
	cytoscape.EdgeData

	EdgeType  string `json:"edgeType"`
	EdgeLabel string `json:"edgeLabel"`
}
