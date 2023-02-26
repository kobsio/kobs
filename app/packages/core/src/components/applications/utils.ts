import cytoscape from 'cytoscape';

/**
 * The `IApplicationOptions` interface defines all options which can be set by a user to get a list of applications on
 * the `ApplicationsPage` or `TopologyPage`.
 */
export interface IApplicationOptions {
  all?: boolean;
  clusters?: string[];
  namespaces?: string[];
  page?: number;
  perPage?: number;
  searchTerm?: string;
  tags?: string[];
}

/**
 * `ITopology` is the interface for the topology graph data as it is returned by our API.
 */
export interface ITopology {
  edges: IEdge[];
  nodes: INode[];
}

/**
 * `INode` is a single node for the topology graph. It implements the ElementDefinition interface from cytoscape.
 */
export interface INode extends cytoscape.ElementDefinition {
  data: INodeData;
}

export interface INodeData {
  cluster: string;
  external: string;
  id: string;
  label: string;
  name: string;
  namespace: string;
}

/**
 * IEdge is a single edge for the topology graph. It implements the ElementDefinition interface from cytoscape.
 */
export interface IEdge extends cytoscape.ElementDefinition {
  data: IEdgeData;
}

export interface IEdgeData {
  description: string;
  id: string;
  source: string;
  target: string;
}
