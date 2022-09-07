import { LabelProps } from '@patternfly/react-core';

import { ITimes } from '@kobsio/shared';

// IOptions is the interface for all options, which can be set for Jaeger to get a list of traces.
export interface IOptions {
  limit: string;
  maxDuration: string;
  minDuration: string;
  operation: string;
  service: string;
  tags: string;
  times: ITimes;
}

// IPanelOptions is the interface for the options property for the Jaeger panel component. A user can set the same
// properties as he can select in the Jaeger page.
export interface IPanelOptions {
  queries?: IQuery[];
  showChart?: boolean;
}

export interface IQuery {
  name?: string;
  limit?: string;
  maxDuration?: string;
  minDuration?: string;
  operation?: string;
  service?: string;
  tags?: string;
}

// IOperation is the interface for a single operation as it is returned by the API.
export interface IOperation {
  name: string;
  spanKind: string;
}

// The following interfaces are used to represent a trace like it returned from the API.
// See: https://github.com/jaegertracing/jaeger-ui/blob/master/packages/jaeger-ui/src/types/trace.tsx
export interface IKeyValuePair {
  key: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

export interface ILink {
  url: string;
  text: string;
}

export interface ILog {
  timestamp: number;
  fields: IKeyValuePair[];
}

export interface IProcess {
  serviceName: string;
  tags: IKeyValuePair[];
  // color is a custom field, which we add after the all traces are loaded from the API. It is used to simplify the
  // coloring and to have a consistent color accross all traces.
  color?: LabelProps['color'];
}

export interface ISpanReference {
  refType: 'CHILD_OF' | 'FOLLOWS_FROM';
  // eslint-disable-next-line no-use-before-define
  span: ISpan | null | undefined;
  spanID: string;
  traceID: string;
}

export interface ISpanData {
  spanID: string;
  traceID: string;
  processID: string;
  operationName: string;
  startTime: number;
  duration: number;
  logs: ILog[];
  tags?: IKeyValuePair[];
  references?: ISpanReference[];
  warnings?: string[] | null;
}

export interface ISpan extends ISpanData {
  depth: number;
  hasChildren: boolean;
  process: IProcess;
  relativeStartTime: number;
  tags: NonNullable<ISpanData['tags']>;
  references: NonNullable<ISpanData['references']>;
  warnings: NonNullable<ISpanData['warnings']>;
  subsidiarilyReferencedBy: ISpanReference[];
}

export interface ITraceData {
  processes: Record<string, IProcess>;
  traceID: string;
}

export interface ITrace extends ITraceData {
  duration: number;
  endTime: number;
  spans: ISpan[];
  startTime: number;
  traceName: string;
  services: { name: string; numberOfSpans: number }[];
}

// IProcessColors is the interface we use to store a map of process and colors, so that we can reuse the color for
// processes with the same service name.
export interface IProcessColors {
  [key: string]: LabelProps['color'];
}

// IDeduplicateTags is the interface, which is returned by the deduplicateTags function.
export interface IDeduplicateTags {
  tags: IKeyValuePair[];
  warnings: string[];
}

// IMonitorOptions is the interface for all options, which can be set for Jaeger to get a the metrics for a service.
export interface IMonitorOptions {
  service: string;
  times: ITimes;
}

// IMetrics is the JSON format which is returned by the Jaeger API for a metrics call.
export interface IMetrics {
  name: string;
  type: string;
  help: string;
  metrics: IMetric[];
}

export interface IMetric {
  labels: IMetricLabel[];
  metricPoints: IMetricPoint[];
}

export interface IMetricLabel {
  name: string;
  value: string;
}

export interface IMetricPoint {
  gaugeValue: IMetricGaugeValue;
  timestamp: string;
}
export interface IMetricGaugeValue {
  doubleValue: number | string;
}

export interface IChartData {
  name: string;
  data: IChartDatum[];
}

export interface IChartDatum {
  x: Date;
  y: number | null;
}

export interface IOperationData {
  operation: string;
  avgs: number[];
  impact: number;
  chartData: IChartData[];
}
