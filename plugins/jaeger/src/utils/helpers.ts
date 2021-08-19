import { IOptions, ISpan, ITrace } from './interfaces';
import { IPluginTimes, TTime, TTimeOptions, formatTime } from '@kobsio/plugin-core';
import { getColor } from './colors';

// getOptionsFromSearch is used to get the Jaeger options from a given search location.
export const getOptionsFromSearch = (search: string): IOptions => {
  const params = new URLSearchParams(search);
  const limit = params.get('limit');
  const maxDuration = params.get('maxDuration');
  const minDuration = params.get('minDuration');
  const operation = params.get('operation');
  const service = params.get('service');
  const tags = params.get('tags');
  const time = params.get('time');
  const timeEnd = params.get('timeEnd');
  const timeStart = params.get('timeStart');

  return {
    limit: limit ? limit : '20',
    maxDuration: maxDuration ? maxDuration : '',
    minDuration: minDuration ? minDuration : '',
    operation: operation ? operation : '',
    service: service ? service : '',
    tags: tags ? tags : '',
    times: {
      time: time && TTimeOptions.includes(time) ? (time as TTime) : 'last15Minutes',
      timeEnd:
        time && TTimeOptions.includes(time) && timeEnd ? parseInt(timeEnd as string) : Math.floor(Date.now() / 1000),
      timeStart:
        time && TTimeOptions.includes(time) && timeStart
          ? parseInt(timeStart as string)
          : Math.floor(Date.now() / 1000) - 900,
    },
  };
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

// formatAxisBottom calculates the format for the bottom axis based on the specified start and end time.
export const formatAxisBottom = (times: IPluginTimes): string => {
  if (times.timeEnd - times.timeStart < 3600) {
    return '%H:%M:%S';
  } else if (times.timeEnd - times.timeStart < 86400) {
    return '%H:%M';
  } else if (times.timeEnd - times.timeStart < 604800) {
    return '%m-%d %H:%M';
  }

  return '%m-%d';
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

// formatTraceTime is a wrapper around the formatTime function from the core plugin.
export const formatTraceTime = (time: number): string => {
  return formatTime(Math.floor(time / 1000000));
};

// getRootSpan returns the first span of a trace. Normally this should be the first span, but sometime it can happen,
// that this isn't the case. So that we have to loop over the spans and then we return the first trace, which doesn't
// have a reference.
export const getRootSpan = (spans: ISpan[]): ISpan | undefined => {
  for (const span of spans) {
    if (span.references.length === 0 || span.references[0].refType !== 'CHILD_OF') {
      return span;
    }
  }

  return undefined;
};

// IService is the interface to get the number of spans per service.
export interface IService {
  color: string;
  service: string;
  spans: number;
}

export interface IServices {
  [key: string]: IService;
}

// getSpansPerServices returns the number of spans per service.
export const getSpansPerServices = (trace: ITrace): IServices => {
  const services: IService[] = Object.keys(trace.processes).map((process) => {
    return {
      color: trace.processes[process].color
        ? (trace.processes[process].color as string)
        : 'var(--pf-global--primary-color--100)',
      service: trace.processes[process].serviceName,
      spans: trace.spans.filter((span) => span.processID === process).length,
    };
  });

  const uniqueServices: IServices = {};
  for (const service of services) {
    if (uniqueServices.hasOwnProperty(service.service)) {
      uniqueServices[service.service] = {
        ...uniqueServices[service.service],
        spans: uniqueServices[service.service].spans + service.spans,
      };
    } else {
      uniqueServices[service.service] = service;
    }
  }

  return uniqueServices;
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

  spans.sort((a, b) => {
    if (a.startTime < b.startTime) {
      return -1;
    }

    return 1;
  });

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

// IProcessColors is the interface we use to store a map of process and colors, so that we can reuse the color for
// processes with the same service name.
interface IProcessColors {
  [key: string]: string;
}

// addColorForProcesses add a color to each process in all the given traces. If a former trace already uses a process,
// with the same service name we reuse the former color.
export const addColorForProcesses = (traces: ITrace[]): ITrace[] => {
  const usedColors: IProcessColors = {};

  for (let i = 0; i < traces.length; i++) {
    const processes = Object.keys(traces[i].processes);

    for (let j = 0; j < processes.length; j++) {
      const process = processes[j];

      if (usedColors.hasOwnProperty(traces[i].processes[process].serviceName)) {
        traces[i].processes[process].color = usedColors[traces[i].processes[process].serviceName];
      } else {
        const color = getColor(j);
        usedColors[traces[i].processes[process].serviceName] = color;
        traces[i].processes[process].color = color;
      }
    }
  }

  return traces;
};
