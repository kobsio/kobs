import cytoscape from 'cytoscape';

import { IPluginTimes } from '@kobsio/plugin-core';
import { IRowValues } from '@kobsio/plugin-prometheus';

export interface IPluginOptions {
  prometheus: boolean;
}

// IOptions is the interface for the options on the Istio page.
export interface IOptions {
  namespaces: string[];
  times: IPluginTimes;
}

// IPanelOptions is the interface for the options property for the Istio panel component.
export interface IPanelOptions {
  namespaces?: string[];
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
  metrics: IRowValues;
}

// IEdge is a single edge for the topology graph. It implements the ElementDefinition interface from cytoscape.
export interface IEdge extends cytoscape.ElementDefinition {
  data: IEdgeData;
}

export interface IEdgeData {
  id: string;
  source: string;
  target: string;
}
