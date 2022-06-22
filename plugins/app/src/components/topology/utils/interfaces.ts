import cytoscape from 'cytoscape';

export interface IPanelOptions {
  satellite?: string;
  cluster?: string;
  namespace?: string;
  name?: string;
}

export interface ITopology {
  edges: IEdge[];
  nodes: INode[];
}

// INode is a single node for the topology graph. It implements the ElementDefinition interface from cytoscape.
export interface INode extends cytoscape.ElementDefinition {
  data: INodeData;
}

export interface INodeData {
  id: string;
  label: string;
  cluster: string;
  namespace: string;
  name: string;
  external: string;
}

// IEdge is a single edge for the topology graph. It implements the ElementDefinition interface from cytoscape.
export interface IEdge extends cytoscape.ElementDefinition {
  data: IEdgeData;
}

export interface IEdgeData {
  id: string;
  source: string;
  target: string;
  description: string;
}
