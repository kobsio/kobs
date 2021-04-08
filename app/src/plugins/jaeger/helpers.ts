import { ChartThemeColor, getDarkThemeColors } from '@patternfly/react-charts';

import { Query, Spec } from 'proto/jaeger_grpc_web_pb';
import { Plugin } from 'proto/plugins_grpc_web_pb';
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
  color: string;
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
      color: trace.processes[process].color
        ? (trace.processes[process].color as string)
        : 'var(--pf-global--primary-color--100)',
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

// colors is an array of all supported colors for the Jaeger processes.
const colors = getDarkThemeColors(ChartThemeColor.multiOrdered).area.colorScale;

// addColorForProcesses add a color to each process in all the given traces.
export const addColorForProcesses = (traces: ITrace[]): ITrace[] => {
  for (let i = 0; i < traces.length; i++) {
    Object.keys(traces[i].processes).map(
      (key, index) => (traces[i].processes[key].color = colors[index % colors.length]),
    );
  }

  return traces;
};

// ITags is the interface for our temporary json object for the user specified tags.
interface ITags {
  [key: string]: string;
}

// encodeTags encodes the user specified tags string into the correct format for the Jaeger API. The user has to provide
// the tags in the following form 'http.status_code=500 http.method=POST'. We will transform this into a json object of
// the following form: '{"http.status_code":"500","http.method":"POST"}'. The encoded string is then used for the API
// request.
export const encodeTags = (tags: string): string => {
  const t = tags.split(' ');
  const jsonTags: ITags = {};

  for (let i = 0; i < t.length; i++) {
    const keyValue = t[i].split('=');
    if (keyValue.length === 2) {
      jsonTags[keyValue[0]] = keyValue[1];
    }
  }

  return encodeURIComponent(JSON.stringify(jsonTags));
};

// doesSpanContainsError returns true, when the given span contains a tag error=true. This is used to show the user a
// problematic span, whithout the need to check all tags.
export const doesSpanContainsError = (span: ISpan): boolean => {
  for (let i = 0; i < span.tags.length; i++) {
    if (span.tags[i].key === 'error' && span.tags[i].value === true) {
      return true;
    }
  }

  return false;
};

// doesTraceContainsError returns true, when a span of the given trace contains a tag error=true. This is used to show
// the user a problematic trace, whithout the need to check all tags of all spans.
export const doesTraceContainsError = (trace: ITrace): boolean => {
  for (let i = 0; i < trace.spans.length; i++) {
    if (doesSpanContainsError(trace.spans[i])) {
      return true;
    }
  }

  return false;
};

// jsonToProto is used to convert a json object into the protobuf message format for the Prometheus plugin. This is
// needed, so that users can use the plugin within resources, where the plugin specs are specified as json object.
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const jsonToProto = (json: any): Plugin.AsObject | undefined => {
  if (!json.jaeger || !json.jaeger.queries || !Array.isArray(json.jaeger.queries)) {
    return undefined;
  }

  const queries: Query[] = [];
  for (const query of json.jaeger.queries) {
    if (query.name && query.service) {
      const q = new Query();
      q.setName(query.name);
      q.setService(query.service);
      q.setOperation(query.operation ? query.operation : '');
      q.setTags(query.tags ? query.tags : '');
      queries.push(q);
    } else {
      return undefined;
    }
  }

  const jaeger = new Spec();
  jaeger.setQueriesList(queries);

  const plugin = new Plugin();
  plugin.setName(json.name);
  plugin.setJaeger(jaeger);

  return plugin.toObject();
};
