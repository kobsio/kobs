// IPanelOptions is the interface for the options property for the Kiali panel component. A user can set a list of
// namespaces and a duration to overwrite the selected time range in the dashboard.
export interface IPanelOptions {
  namespaces?: string[];
  duration?: number;
}

// IGraph is the interface for the Kiali topology graph including our custom fields. It should implement the same fields
// as the Graph struct from the plugins/kiali/pkg/instance/instance.go file.
// The interfaces and types used in the Kiali frontend can be found in the following file:
// https://github.com/kiali/kiali-ui/blob/master/src/types/Graph.ts
export interface IGraph {
  elements?: IElements;
}

export interface IElements {
  nodes?: INodeWrapper;
  edges?: IEdgeWrapper;
}

export interface INodeWrapper {
  data?: INodeData;
}

export interface INodeData {
  id: string;
  parent?: string;
  nodeType: TNodeType;
  cluster: string;
  namespace: string;
  workload?: string;
  app?: string;
  version?: string;
  service?: string;
  aggregate?: string;
  aggregateValue?: string;
  destServices?: IDestService[];
  traffic?: ITraffic[];
  hasCB?: boolean;
  hasFaultInjection?: boolean;
  hasHealthConfig?: IHealthConfig;
  hasMissingSC?: boolean;
  hasRequestRouting?: boolean;
  hasRequestTimeout?: boolean;
  hasTCPTrafficShifting?: boolean;
  hasTrafficShifting?: boolean;
  hasVS?: boolean;
  isBox?: string;
  isDead?: boolean;
  isIdle?: boolean;
  isInaccessible?: boolean;
  isMisconfigured?: string;
  isOutside?: boolean;
  isRoot?: boolean;
  isServiceEntry?: ISEInfo;

  nodeLabel: string;
  nodeLabelFull: string;
  nodeImage: string;
}

export interface IEdgeWrapper {
  data?: IEdgeData;
}

export interface IEdgeData {
  id: string;
  source: string;
  target: string;
  destPrincipal?: string;
  responseTime?: number;
  sourcePrincipal?: string;
  traffic?: ITraffic;
  isMTLS?: number;

  edgeType: string;
  edgeLabel: string;
}

export interface IDestService {
  cluster: string;
  namespace: string;
  name: string;
}

export interface ISEInfo {
  hosts: string[];
  location: string;
  namespace: string;
}

export interface ITraffic {
  protocol: TProtocols;
  rates: ITrafficHTTPRates | ITrafficGRPCRates | ITrafficTCPRates;
  responses: ITrafficResponses;
}

export interface ITrafficHTTPRates {
  http: string;
  httpPercentErr?: string;
}

export interface ITrafficGRPCRates {
  grpc: string;
  grpcPercentErr?: string;
}

export interface ITrafficTCPRates {
  tcp: string;
}

export type ITrafficResponses = {
  [responseCode: string]: ITrafficResponse;
};

export type ITrafficResponse = {
  flags: ITrafficFlags;
  hosts: ITrafficHosts;
};

export type ITrafficFlags = {
  [flag: string]: string;
};

export type ITrafficHosts = {
  [host: string]: string;
};

export type IHealthConfig = {
  [key: string]: string;
};

export type TNodeType = 'aggregate' | 'app' | 'box' | 'service' | 'serviceentry' | 'unknown' | 'workload';
export type TProtocols = 'http' | 'grpc' | 'tcp';
