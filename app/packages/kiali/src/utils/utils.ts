import { ITimes } from '@kobsio/core';

export const description =
  'The Console for Istio Service Mesh - Manage, visualize, validate and troubleshoot your mesh.';

/**
 * `IGraph` is the interface for the Kiali topology graph including our custom fields. It should implement the same
 * fields as the Graph struct from the pkg/plugins/kiali/instance/types.go file.
 *
 * The interfaces and types used in the Kiali frontend can be found in the following file:
 * https://github.com/kiali/kiali-ui/blob/master/src/types/Graph.ts
 */
export interface IGraph {
  elements?: IElements;
}

export interface IElements {
  edges?: IEdgeWrapper[];
  nodes?: INodeWrapper[];
}

export interface INodeWrapper {
  data?: INodeData;
}

export interface INodeData {
  aggregate?: string;
  aggregateValue?: string;
  app?: string;
  cluster: string;
  destServices?: IDestService[];
  hasCB?: boolean;
  hasFaultInjection?: boolean;
  hasHealthConfig?: IHealthConfig;
  hasMirroring?: boolean;
  hasMissingSC?: boolean;
  hasRequestRouting?: boolean;
  hasRequestTimeout?: boolean;
  hasTCPTrafficShifting?: boolean;
  hasTrafficShifting?: boolean;
  hasVS?: {
    hostnames?: string[];
  };
  hasWorkloadEntry?: {
    name: string;
  }[];
  id: string;
  isBox?: string;
  isDead?: boolean;
  isGateway?: {
    egressInfo?: {
      hostnames?: string[];
    };
    ingressInfo?: {
      hostnames?: string[];
    };
  };
  isIdle?: boolean;
  isInaccessible?: boolean;
  isMisconfigured?: string;
  isOutside?: boolean;
  isRoot?: boolean;
  isServiceEntry?: ISEInfo;
  labels?: { [key: string]: string };
  namespace: string;
  nodeImage: string;
  nodeLabel: string;
  nodeLabelFull: string;
  nodeType: TNodeType;
  parent?: string;
  service?: string;
  traffic?: ITraffic[];
  version?: string;
  workload?: string;
}

export interface IEdgeWrapper {
  data?: IEdgeData;
}

export interface IEdgeData {
  destPrincipal?: string;
  edgeLabel: string;
  edgeType: string;
  id: string;
  isMTLS?: number;
  responseTime?: number;
  source: string;
  sourcePrincipal?: string;
  target: string;
  traffic?: ITraffic;
}

export interface IDestService {
  cluster: string;
  name: string;
  namespace: string;
}

export interface ISEInfo {
  hosts: string[];
  location: string;
  namespace: string;
}

export interface ITraffic {
  protocol: TProtocols;
  rates: ITrafficHTTPRates | ITrafficGRPCRates | ITrafficTCPRates;
  responses: Record<string, ITrafficResponse | undefined>;
}

export interface ITrafficHTTPRates {
  http: string;
  httpIn?: string;
  httpIn4xx?: string;
  httpIn5xx?: string;
  httpInNoResponse?: string;
  httpOut?: string;
  httpPercentErr?: string;
}

export interface ITrafficGRPCRates {
  grpc: string;
  grpcIn?: string;
  grpcOut?: string;
  grpcPercentErr?: string;
}

export interface ITrafficTCPRates {
  tcp: string;
}

export type ITrafficResponse = {
  flags?: Record<string, string | undefined>;
  hosts?: Record<string, string | undefined>;
};

export type IHealthConfig = {
  [key: string]: string;
};

export type TNodeType = 'aggregate' | 'app' | 'box' | 'service' | 'serviceentry' | 'unknown' | 'workload';
export type TProtocols = 'http' | 'grpc' | 'tcp';

/**
 * `IMetricsMap` is the interface for the returned metrics from the Kiali API.
 * See: https://github.com/kiali/kiali-ui/blob/master/src/types/Metrics.ts
 */
export type IMetricsMap = {
  request_count?: IMetric[];
  request_duration_millis?: IMetric[];
  request_error_count?: IMetric[];
  request_size?: IMetric[];
  request_throughput?: IMetric[];
  response_size?: IMetric[];
  response_throughput?: IMetric[];
  tcp_received?: IMetric[];
  tcp_sent?: IMetric[];
};

export interface IMetric {
  datapoints: IDatapoint[];
  labels: ILabels;
  name: string;
  stat?: string;
}

export type ILabels = {
  [key: string]: string;
};

export type IDatapoint = [number, string];

/**
 * `IChart` is the interface to render a chart for the returned data from the Kiali API. To get the data we have to use
 * the `convertMetrics` function.
 */
export interface IChart {
  data: IChartData[];
  title: string;
  unit: string;
}

export interface IChartData {
  data: IChartDatum[];
  name: string;
}

export interface IChartDatum {
  name: string;
  x: Date;
  y: number | null;
}

/**
 * `getStepAndRateIntervalParameters` returns the `step` and `rateInterval` query parameters to get the metrics for the
 * given time range.
 */
export const getStepAndRateIntervalParameters = (times: ITimes): string => {
  const steps = (times.timeEnd - times.timeStart) / 50;
  return `&step=${steps}&rateInterval=${steps}s`;
};

/**
 * `convertMetrics` converts the data returned by the Kiali API to an array which we can use in our charting library.
 */
export const convertMetrics = (metrics: IMetric[]): IChartData[] => {
  const data: IChartData[] = [];

  for (const metric of metrics) {
    const name = getMetricLabel(metric);

    data.push({
      data: metric.datapoints.map((datum) => ({
        name: name,
        x: new Date(datum[0] * 1000),
        y: parseFloat(datum[1]),
      })),
      name: name,
    });
  }

  return data;
};

const getMetricLabel = (metric: IMetric): string => {
  if (metric.name === 'tcp_received') {
    return 'TCP Received';
  } else if (metric.name === 'tcp_sent') {
    return 'TCP Send';
  } else if (metric.name === 'request_count') {
    return 'Request Count';
  } else if (metric.name === 'request_error_count') {
    return 'Request Error Count';
  } else if (metric.name === 'request_duration_millis') {
    return metric.stat || 'Duration';
  }

  return '';
};
