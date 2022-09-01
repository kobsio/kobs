import cytoscape from 'cytoscape';

import { IRowValues } from './prometheus/interfaces';
import { ITimes } from '@kobsio/shared';

export interface IPluginOptions {
  prometheus: boolean;
  klogs: boolean;
}

// IApplicationsOptions is the interface for the Istio applications page.
export interface IApplicationsOptions {
  namespaces: string[];
  times: ITimes;
}

// IApplicationOptions is the interface for the Istio application page.
export interface IApplicationOptions {
  view: string;
  times: ITimes;
  filters: IFilters;
}

// IFilters is the interface to specify filters for the tab and top view of an Istio application.
export interface IFilters {
  upstreamCluster: string;
  method: string;
  path: string;
}

// IPanelOptions is the interface for the options property for the Istio panel component.
export interface IPanelOptions {
  type?: string;
  namespaces?: string[];
  application?: string;
  filters?: IFilters;
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

// ILogLine represents a single log line.
export interface ILogLine {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// ITopDetailsMetrics contains the success rate and the latency series which can be used within our charts.
export interface ITopDetailsMetrics {
  sr: { name: string; data: { x: Date; y: number }[] }[];
  latency: { name: string; data: { x: Date; y: number }[] }[];
}
