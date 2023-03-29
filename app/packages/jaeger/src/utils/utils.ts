import { getChartColor } from '@kobsio/core';

import TreeNode from './TreeNode';

export const description =
  'Open source, end-to-end distributed tracing: Monitor and troubleshoot transactions in complex distributed systems.';

export const spanKinds = ['unspecified', 'internal', 'server', 'client', 'producer', 'consumer'];

/**
 * The following interfaces are used to represent a trace like it returned from the API.
 * See: https://github.com/jaegertracing/jaeger-ui/blob/master/packages/jaeger-ui/src/types/trace.tsx
 */
export interface IKeyValuePair {
  key: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

export interface ILog {
  fields: IKeyValuePair[];
  timestamp: number;
}

export interface IProcess {
  serviceName: string;
  tags: IKeyValuePair[];
}

export interface ISpanReference {
  refType: 'CHILD_OF' | 'FOLLOWS_FROM';
  // eslint-disable-next-line no-use-before-define
  span: ISpan | null | undefined;
  spanID: string;
  traceID: string;
}

export interface ISpanData {
  duration: number;
  logs: ILog[];
  operationName: string;
  processID: string;
  references?: ISpanReference[];
  spanID: string;
  startTime: number;
  tags?: IKeyValuePair[];
  traceID: string;
  warnings?: string[] | null;
}

export interface ISpan extends ISpanData {
  depth: number;
  hasChildren: boolean;
  process: IProcess;
  references: NonNullable<ISpanData['references']>;
  relativeStartTime: number;
  subsidiarilyReferencedBy: ISpanReference[];
  tags: NonNullable<ISpanData['tags']>;
  warnings: NonNullable<ISpanData['warnings']>;
}

export interface ITraceData {
  processes: Record<string, IProcess>;
  traceID: string;
}

export interface ITrace extends ITraceData {
  duration: number;
  endTime: number;
  services: { name: string; numberOfSpans: number }[];
  spans: ISpan[];
  startTime: number;
  traceName: string;
}

/**
 * `IDeduplicateTags` is the interface, which is returned by the `deduplicateTags` function.
 */
export interface IDeduplicateTags {
  tags: IKeyValuePair[];
  warnings: string[];
}

/**
 * `formatTraceTime` is a wrapper around the formatTime function from the core plugin.
 */
export const formatTraceTime = (timestamp: number): string => {
  const d = new Date(Math.floor(timestamp / 1000));

  return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)} ${(
    '0' + d.getHours()
  ).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}:${('0' + d.getSeconds()).slice(-2)}.${(
    '0' + d.getMilliseconds()
  ).slice(-3)}`;
};

/**
 * `getColors` retruns a record for the provided `traces` with the process names as keys and the color as value.
 */
export const getColors = (traces: ITrace[]): Record<string, string> => {
  const colors: Record<string, string> = {};
  let index = 0;

  for (let i = 0; i < traces.length; i++) {
    const processes = Object.keys(traces[i].processes);

    for (let j = 0; j < processes.length; j++) {
      const process = processes[j];

      if (!(traces[i].processes[process].serviceName in colors)) {
        colors[traces[i].processes[process].serviceName] = getChartColor(index);
        index = index + 1;
      }
    }
  }

  return colors;
};

/**
 * `getTraceName` returns the name of the trace. The name consists out of the first spans service name and operation
 * name.
 * See: https://github.com/jaegertracing/jaeger-ui/blob/master/packages/jaeger-ui/src/model/trace-viewer.tsx
 */
const getTraceName = (spans: ISpan[]): string => {
  let candidateSpan: ISpan | undefined;
  const allIDs: Set<string> = new Set(spans.map(({ spanID }) => spanID));

  for (let i = 0; i < spans.length; i++) {
    const hasInternalRef =
      spans[i].references &&
      spans[i].references.some(({ traceID, spanID }) => traceID === spans[i].traceID && allIDs.has(spanID));
    if (hasInternalRef) continue;

    if (!candidateSpan) {
      candidateSpan = spans[i];
      continue;
    }

    const thisRefLength = (spans[i].references && spans[i].references.length) || 0;
    const candidateRefLength = (candidateSpan.references && candidateSpan.references.length) || 0;

    if (
      thisRefLength < candidateRefLength ||
      (thisRefLength === candidateRefLength && spans[i].startTime < candidateSpan.startTime)
    ) {
      candidateSpan = spans[i];
    }
  }

  return candidateSpan ? `${candidateSpan.process.serviceName}: ${candidateSpan.operationName}` : '';
};

/**
 * `deduplicateTags` deduplicates the tags of a given span.
 * See: https://github.com/jaegertracing/jaeger-ui/blob/master/packages/jaeger-ui/src/model/transform-trace-data.tsx
 */
const deduplicateTags = (spanTags: IKeyValuePair[]): IDeduplicateTags => {
  const warningsHash: Map<string, string> = new Map<string, string>();
  const tags: IKeyValuePair[] = spanTags.reduce<IKeyValuePair[]>((uniqueTags, tag) => {
    if (!uniqueTags.some((t) => t.key === tag.key && t.value === tag.value)) {
      uniqueTags.push(tag);
    } else {
      warningsHash.set(`${tag.key}:${tag.value}`, `Duplicate tag "${tag.key}:${tag.value}"`);
    }
    return uniqueTags;
  }, []);
  const warnings = Array.from(warningsHash.values());
  return { tags, warnings };
};

/**
 * `getTraceSpanIdsAsTree` returns a new TreeNode object, which is used to sort the spans of a trace. The tree is
 * necessary to sort the spans, so children follow parents, and siblings are sorted by start time.
 * See: https://github.com/jaegertracing/jaeger-ui/blob/master/packages/jaeger-ui/src/selectors/trace.js
 */
const getTraceSpanIdsAsTree = (trace: ITrace): TreeNode => {
  const nodesById = new Map(trace.spans.map((span) => [span.spanID, new TreeNode(span.spanID)]));
  const spansById = new Map(trace.spans.map((span) => [span.spanID, span]));
  const root = new TreeNode('__root__');

  trace.spans.forEach((span) => {
    const node = nodesById.get(span.spanID);
    if (Array.isArray(span.references) && span.references.length) {
      const { refType, spanID: parentID } = span.references[0];
      if (refType === 'CHILD_OF' || refType === 'FOLLOWS_FROM') {
        const parent = nodesById.get(parentID) || root;
        parent.children.push(node);
      } else {
        throw new Error(`Unrecognized ref type: ${refType}`);
      }
    } else {
      root.children.push(node);
    }
  });

  const comparator = (nodeA: TreeNode, nodeB: TreeNode): number => {
    const a = spansById.get(nodeA.value);
    const b = spansById.get(nodeB.value);
    if (!a || !b) return -1;
    return +(a.startTime > b.startTime) || +(a.startTime === b.startTime) - 1;
  };

  trace.spans.forEach((span) => {
    const node = nodesById.get(span.spanID);
    if (node && node.children.length > 1) {
      node.children.sort(comparator);
    }
  });

  root.children.sort(comparator);
  return root;
};

/**
 * `transformTraceData` transforms a given trace so we can used it within our ui.
 * See: https://github.com/jaegertracing/jaeger-ui/blob/master/packages/jaeger-ui/src/model/transform-trace-data.tsx
 */
export const transformTraceData = (data: ITrace): ITrace | null => {
  let { traceID } = data;
  if (!traceID) {
    return null;
  }
  traceID = traceID.toLowerCase();

  let traceEndTime = 0;
  let traceStartTime = Number.MAX_SAFE_INTEGER;
  const spanIdCounts = new Map();
  const spanMap = new Map<string, ISpan>();

  // filter out spans with empty start times
  data.spans = data.spans.filter((span) => Boolean(span.startTime));

  const max = data.spans.length;
  for (let i = 0; i < max; i++) {
    const span: ISpan = data.spans[i] as ISpan;
    const { startTime, duration, processID } = span;

    let spanID = span.spanID;

    // check for start / end time for the trace
    if (startTime < traceStartTime) {
      traceStartTime = startTime;
    }
    if (startTime + duration > traceEndTime) {
      traceEndTime = startTime + duration;
    }

    // make sure span IDs are unique
    const idCount = spanIdCounts.get(spanID);
    if (idCount != null) {
      spanIdCounts.set(spanID, idCount + 1);
      spanID = `${spanID}_${idCount}`;
      span.spanID = spanID;
    } else {
      spanIdCounts.set(spanID, 1);
    }
    span.process = data.processes[processID];
    spanMap.set(spanID, span);
  }

  const tree = getTraceSpanIdsAsTree(data);
  const spans: ISpan[] = [];
  const svcCounts: Record<string, number> = {};

  tree.walk((spanID: string, node: TreeNode, depth = 0) => {
    if (spanID === '__root__') {
      return;
    }
    const span = spanMap.get(spanID) as ISpan;
    if (!span) {
      return;
    }
    const { serviceName } = span.process;
    svcCounts[serviceName] = (svcCounts[serviceName] || 0) + 1;
    span.relativeStartTime = span.startTime - traceStartTime;
    span.depth = depth - 1;
    span.hasChildren = node.children.length > 0;
    span.warnings = span.warnings || [];
    span.tags = span.tags || [];
    span.references = span.references || [];
    const tagsInfo = deduplicateTags(span.tags);
    span.tags = tagsInfo.tags;
    span.warnings = span.warnings.concat(tagsInfo.warnings);
    span.references.forEach((ref, index) => {
      const refSpan = spanMap.get(ref.spanID) as ISpan;
      if (refSpan) {
        ref.span = refSpan;
        if (index > 0) {
          // Don't take into account the parent, just other references.
          refSpan.subsidiarilyReferencedBy = refSpan.subsidiarilyReferencedBy || [];
          refSpan.subsidiarilyReferencedBy.push({
            refType: ref.refType,
            span,
            spanID,
            traceID,
          });
        }
      }
    });

    spans.push(span);
  });

  const traceName = getTraceName(spans);
  const services = Object.keys(svcCounts).map((name) => ({ name, numberOfSpans: svcCounts[name] }));

  return {
    duration: traceEndTime - traceStartTime,
    endTime: traceEndTime,
    processes: data.processes,
    services,
    spans,
    startTime: traceStartTime,
    traceID,
    traceName,
  };
};

/**
 * `encodeTags` encodes the user specified tags string into the correct format for the Jaeger API. The user has to
 * provide the tags in the following form 'http.status_code=500 http.method=POST'. We will transform this into a json
 * object of the following form: '{"http.status_code":"500","http.method":"POST"}'. The encoded string is then used for
 * the API request.
 */
export const encodeTags = (tags: string): string => {
  const t = tags.split(' ');
  const jsonTags: Record<string, string> = {};

  for (let i = 0; i < t.length; i++) {
    const keyValue = t[i].split('=');
    if (keyValue.length === 2) {
      jsonTags[keyValue[0]] = keyValue[1];
    }
  }

  return encodeURIComponent(JSON.stringify(jsonTags));
};

/**
 * `doesTraceContainsError` returns true, when a span of the given trace contains a tag error=true. This is used to show
 * the user a problematic trace, whithout the need to check all tags of all spans.
 */
export const doesTraceContainsError = (trace: ITrace): boolean => {
  for (let i = 0; i < trace.spans.length; i++) {
    if (doesSpanContainsError(trace.spans[i])) {
      return true;
    }
  }

  return false;
};

/**
 * `doesSpanContainsError` returns true, when the given span contains a tag error=true. This is used to show the user a
 * problematic span, whithout the need to check all tags.
 */
export const doesSpanContainsError = (span: ISpan): boolean => {
  for (let i = 0; i < span.tags.length; i++) {
    if (span.tags[i].key === 'error' && span.tags[i].value === true) {
      return true;
    }
  }

  return false;
};
