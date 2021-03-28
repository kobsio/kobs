import { formatTime } from 'utils/helpers';

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
}

export interface IProcesses {
  [key: string]: IProcess;
}

export interface IReference {
  refType: string;
  spanID: string;
  traceID: string;
}

// ISpan is the interface for a single span, with all available fields. The "offset", "fill" and "childs" fields are not
// present on a span returned by the Jaeger Query API, instead we populate this fields within the React UI, to render
// the spans tree.
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

// ITrace is the interface for a single trace. We have to define the interface by ourselve, because the protobuf service
// just returns a single string with all traces, becaus we had some problems with the protobuf message formate for the
// value field in the IKeyValue interface.
export interface ITrace {
  traceID: string;
  spans: ISpan[];
  processes: IProcesses;
}

// ITimes is the interface for a start and end time.
export interface ITimes {
  timeEnd: number;
  timeStart: number;
}

// IJaegerOptions is the interface for all options, which can be set for a Jaeger query.
export interface IJaegerOptions extends ITimes {
  limit: string;
  maxDuration: string;
  minDuration: string;
  queryName: string;
  operation: string;
  service: string;
  tags: string;
}

// IServiceSpans is the interface to get the number of spans per service.
export interface IServiceSpans {
  service: string;
  spans: number;
}

// getOptionsFromSearch is used to get the Jaeger options from a given search location.
export const getOptionsFromSearch = (search: string): IJaegerOptions => {
  const params = new URLSearchParams(search);
  const limit = params.get('limit');
  const maxDuration = params.get('maxDuration');
  const minDuration = params.get('minDuration');
  const operation = params.get('operation');
  const service = params.get('service');
  const tags = params.get('tags');
  const timeEnd = params.get('timeEnd');
  const timeStart = params.get('timeStart');

  return {
    limit: limit ? limit : '20',
    maxDuration: maxDuration ? maxDuration : '',
    minDuration: minDuration ? minDuration : '',
    operation: operation ? operation : '',
    queryName: '',
    service: service ? service : '',
    tags: tags ? tags : '',
    timeEnd: timeEnd ? parseInt(timeEnd as string) : Math.floor(Date.now() / 1000),
    timeStart: timeStart ? parseInt(timeStart as string) : Math.floor(Date.now() / 1000) - 3600,
  };
};

// getSpansPerServices returns the number of spans per service.
export const getSpansPerServices = (trace: ITrace): IServiceSpans[] => {
  const services: IServiceSpans[] = Object.keys(trace.processes).map((process) => {
    return {
      service: trace.processes[process].serviceName,
      spans: trace.spans.filter((span) => span.processID === process).length,
    };
  });
  return services;
};

// getDuration returns the duration for a trace in milliseconds.
export const getDuration = (spans: ISpan[]): number => {
  const startTimes: number[] = [];
  const endTimes: number[] = [];

  for (const span of spans) {
    startTimes.push(span.startTime);
    endTimes.push(span.startTime + span.duration);
  }

  return (Math.max(...endTimes) - Math.min(...startTimes)) / 1000;
};

export const formatTraceTime = (time: number): string => {
  return formatTime(Math.floor(time / 1000000));
};

// IMap is the interface for the map of spans in the createSpansTree function.
interface IMap {
  [key: string]: number;
}

// createSpansTree creates a tree of spans. This simplifies the frontend code in contrast to working with the flat array
// of spans.
export const createSpansTree = (spans: ISpan[], traceStartTime: number, duration: number): ISpan[] => {
  const map: IMap = {};
  const roots: ISpan[] = [];

  for (let i = 0; i < spans.length; i++) {
    map[spans[i].spanID] = i;
    spans[i].childs = [];

    spans[i].offset = ((spans[i].startTime - traceStartTime) / 1000 / duration) * 100;
    spans[i].fill = (spans[i].duration / 1000 / duration) * 100;
  }

  for (let i = 0; i < spans.length; i++) {
    const span = spans[i];

    if (span.references && span.references.length > 0) {
      const ref = span.references.filter((reference) => reference.refType === 'CHILD_OF');

      if (ref.length > 0 && map.hasOwnProperty(ref[0].spanID)) {
        spans[map[ref[0].spanID]].childs?.push(span);
      }
    } else {
      roots.push(span);
    }
  }

  return roots;
};
