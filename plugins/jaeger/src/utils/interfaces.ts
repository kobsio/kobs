import { IPluginTimes } from '@kobsio/plugin-core';

// IOptions is the interface for all options, which can be set for Jaeger to get a list of traces.
export interface IOptions {
  limit: string;
  maxDuration: string;
  minDuration: string;
  operation: string;
  service: string;
  tags: string;
  times: IPluginTimes;
}

// IPanelOptions is the interface for the options property for the Jaeger panel component. A user can set the same
// properties as he can select in the Jaeger page.
export interface IPanelOptions {
  limit?: string;
  maxDuration?: string;
  minDuration?: string;
  operation?: string;
  service?: string;
  tags?: string;
  showChart?: boolean;
}

// IOperation is the interface for a single operation as it is returned by the API.
export interface IOperation {
  name: string;
  spanKind: string;
}

// ITrace is the interface for a single trace as it is returned from the API.
export interface ITrace {
  traceID: string;
  spans: ISpan[];
  processes: IProcesses;
}

export interface IKeyValue {
  key: string;
  type: string;
  value: string | boolean | number;
}

export interface ILog {
  timestamp: number;
  fields: IKeyValue[];
}

export interface IProcess {
  serviceName: string;
  tags: IKeyValue[];
  color?: string;
}

export interface IProcesses {
  [key: string]: IProcess;
}

export interface IReference {
  refType: string;
  spanID: string;
  traceID: string;
}

export interface ISpan {
  traceID: string;
  spanID: string;
  flags: number;
  operationName: string;
  references: IReference[];
  startTime: number;
  duration: number;
  tags: IKeyValue[];
  logs: ILog[];
  processID: string;
  offset?: number;
  fill?: number;
  childs?: ISpan[];
}
