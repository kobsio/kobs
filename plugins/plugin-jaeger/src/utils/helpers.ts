import { UseQueryResult, useQuery } from '@tanstack/react-query';

import {
  IChartData,
  IChartDatum,
  IDeduplicateTags,
  IKeyValuePair,
  IMetrics,
  IMonitorOptions,
  IOperationData,
  IOptions,
  ISpan,
  ITrace,
} from './interfaces';
import { IPluginInstance, ITimes, formatTime, getTimeParams } from '@kobsio/shared';
import TreeNode from './TreeNode';

// getInitialOptions is used to get the initial Jaeger options from the url.
export const getInitialOptions = (search: string, isInitial: boolean): IOptions => {
  const params = new URLSearchParams(search);
  const limit = params.get('limit');
  const maxDuration = params.get('maxDuration');
  const minDuration = params.get('minDuration');
  const operation = params.get('operation');
  const service = params.get('service');
  const tags = params.get('tags');

  return {
    limit: limit ? limit : '20',
    maxDuration: maxDuration ? maxDuration : '',
    minDuration: minDuration ? minDuration : '',
    operation: operation ? operation : '',
    service: service ? service : '',
    tags: tags ? tags : '',
    times: getTimeParams(params, isInitial),
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

// getTraceName returns the name of the trace. The name consists out of the first spans service name and operation name.
// See: https://github.com/jaegertracing/jaeger-ui/blob/master/packages/jaeger-ui/src/model/trace-viewer.tsx
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

// deduplicateTags deduplicates the tags of a given span.
// See: https://github.com/jaegertracing/jaeger-ui/blob/master/packages/jaeger-ui/src/model/transform-trace-data.tsx
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

// getTraceSpanIdsAsTree returns a new TreeNode object, which is used to sort the spans of a trace. The tree is
// necessary to sort the spans, so children follow parents, and siblings are sorted by start time.
// See: https://github.com/jaegertracing/jaeger-ui/blob/master/packages/jaeger-ui/src/selectors/trace.js
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

// transformTraceData transforms a given trace so we can used it within our ui.
// See: https://github.com/jaegertracing/jaeger-ui/blob/master/packages/jaeger-ui/src/model/transform-trace-data.tsx
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

// getInitialMonitorOptions is used to get the initial Jaeger options from the url.
export const getInitialMonitorOptions = (search: string, isInitial: boolean): IMonitorOptions => {
  const params = new URLSearchParams(search);
  const service = params.get('service');

  return {
    service: service ? service : '',
    times: getTimeParams(params, isInitial),
  };
};

// useGetServiceLatency is a custom React Hook to run the queries to get the P50, P75 and P95 latency of a service in
// parallel.
export const useGetServiceLatency = (
  instance: IPluginInstance,
  service: string,
  times: ITimes,
): [UseQueryResult<IMetrics, Error>, UseQueryResult<IMetrics, Error>, UseQueryResult<IMetrics, Error>] => {
  const p50 = useQuery<IMetrics, Error>(['jaeger/metrics/latencies/service', instance, service, times, 0.5], () =>
    getServiceLatency(instance, service, times, 0.5),
  );
  const p75 = useQuery<IMetrics, Error>(['jaeger/metrics/latencies/service', instance, service, times, 0.75], () =>
    getServiceLatency(instance, service, times, 0.75),
  );
  const p95 = useQuery<IMetrics, Error>(['jaeger/metrics/latencies/service', instance, service, times, 0.95], () =>
    getServiceLatency(instance, service, times, 0.95),
  );
  return [p50, p75, p95];
};

const getServiceLatency = async (
  instance: IPluginInstance,
  service: string,
  times: ITimes,
  quantile: number,
): Promise<IMetrics> => {
  const response = await fetch(
    `/api/plugins/jaeger/metrics?metric=latencies&service=${service}&quantile=${quantile}&groupByOperation=false&ratePer=600000&step=60000&timeStart=${times.timeStart}&timeEnd=${times.timeEnd}`,
    {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'x-kobs-plugin': instance.name,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'x-kobs-satellite': instance.satellite,
      },
      method: 'get',
    },
  );
  const json = await response.json();

  if (response.status >= 200 && response.status < 300) {
    return json;
  } else {
    if (json.error) {
      throw new Error(json.error);
    } else {
      throw new Error('An unknown error occured');
    }
  }
};

export const serviceMetricsToChartData = (metrics: { name: string; metrics?: IMetrics }[]): IChartData[] => {
  const chartData: IChartData[] = [];

  for (const metric of metrics) {
    if (!metric.metrics || metric.metrics.metrics.length !== 1) {
      chartData.push({ data: [], name: metric.name });
    } else {
      const data: IChartDatum[] = [];

      for (const metricPoint of metric.metrics.metrics[0].metricPoints) {
        data.push({
          x: new Date(metricPoint.timestamp),
          y: typeof metricPoint.gaugeValue.doubleValue === 'number' ? metricPoint.gaugeValue.doubleValue : null,
        });
      }

      chartData.push({ data: data, name: metric.name });
    }
  }

  return chartData;
};

// useGetOperationMetrics is a custom React Hook to run the queries to get the P50, P75 and P95 latency and the error
// rate and calls of each operation for a service.
export const useGetOperationMetrics = (
  instance: IPluginInstance,
  service: string,
  times: ITimes,
): [
  UseQueryResult<IMetrics, Error>,
  UseQueryResult<IMetrics, Error>,
  UseQueryResult<IMetrics, Error>,
  UseQueryResult<IMetrics, Error>,
  UseQueryResult<IMetrics, Error>,
] => {
  const p50 = useQuery<IMetrics, Error>(['jaeger/metrics/latencies/operations', instance, service, times, 0.5], () =>
    getOperationMetrics(instance, service, times, 'latencies', 0.5),
  );
  const p75 = useQuery<IMetrics, Error>(['jaeger/metrics/latencies/operations', instance, service, times, 0.75], () =>
    getOperationMetrics(instance, service, times, 'latencies', 0.75),
  );
  const p95 = useQuery<IMetrics, Error>(['jaeger/metrics/latencies/operations', instance, service, times, 0.95], () =>
    getOperationMetrics(instance, service, times, 'latencies', 0.95),
  );
  const errors = useQuery<IMetrics, Error>(['jaeger/metrics/errors/operations', instance, service, times], () =>
    getOperationMetrics(instance, service, times, 'errors'),
  );
  const calls = useQuery<IMetrics, Error>(['jaeger/metrics/calls/operations', instance, service, times], () =>
    getOperationMetrics(instance, service, times, 'calls'),
  );
  return [p50, p75, p95, errors, calls];
};

const getOperationMetrics = async (
  instance: IPluginInstance,
  service: string,
  times: ITimes,
  metric: string,
  quantile?: number,
): Promise<IMetrics> => {
  const response = await fetch(
    `/api/plugins/jaeger/metrics?metric=${metric}&service=${service}${
      quantile ? `&quantile=${quantile}` : ''
    }&groupByOperation=true&ratePer=600000&step=60000&timeStart=${times.timeStart}&timeEnd=${times.timeEnd}`,
    {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'x-kobs-plugin': instance.name,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'x-kobs-satellite': instance.satellite,
      },
      method: 'get',
    },
  );
  const json = await response.json();

  if (response.status >= 200 && response.status < 300) {
    return json;
  } else {
    if (json.error) {
      throw new Error(json.error);
    } else {
      throw new Error('An unknown error occured');
    }
  }
};

export const operationMetricsToData = (metrics: { name: string; metrics?: IMetrics }[]): IOperationData[] => {
  const operationData: IOperationData[] = [];
  const operations: Record<string, IOperationData> = {};

  let i = 0;

  for (const metric of metrics) {
    if (metric.metrics) {
      for (const operationMetric of metric.metrics.metrics) {
        const operationName =
          operationMetric.labels.filter((label) => label.name === 'operation').length === 1
            ? operationMetric.labels.filter((label) => label.name === 'operation')[0].value
            : '';

        if (operationName !== '') {
          let count = 0;
          let total = 0;

          const data: IChartDatum[] = [];

          for (const metricPoint of operationMetric.metricPoints) {
            if (typeof metricPoint.gaugeValue.doubleValue === 'number') {
              count = count + 1;
              total = total + metricPoint.gaugeValue.doubleValue;
            }

            data.push({
              x: new Date(metricPoint.timestamp),
              y: typeof metricPoint.gaugeValue.doubleValue === 'number' ? metricPoint.gaugeValue.doubleValue : null,
            });
          }

          if (operationName in operations) {
            operations[operationName].avgs[i] = roundNumber(total / count);
            operations[operationName].chartData[i] = { data: data, name: metric.name };
          } else {
            const avgs: number[] = [0, 0, 0, 0, 0];
            const chartData: IChartData[] = [
              { data: [], name: 'P50' },
              { data: [], name: 'P75' },
              { data: [], name: 'P95' },
              { data: [], name: 'Errors' },
              { data: [], name: 'Calls' },
            ];

            avgs[i] = roundNumber(total / count);
            chartData[i] = { data: data, name: metric.name };

            if (i === 0)
              operations[operationName] = {
                avgs: avgs,
                chartData: chartData,
                impact: 0,
                operation: operationName,
              };
          }
        }
      }
    }

    i++;
  }

  for (const operation in operations) {
    operationData.push({
      ...operations[operation],
      impact:
        operations[operation].avgs[2] && operations[operation].avgs[4]
          ? operations[operation].avgs[2] * operations[operation].avgs[4]
          : 0,
    });
  }

  operationData.sort((a, b) => (a.impact > b.impact ? -1 : a.impact < b.impact ? 1 : 0));

  return operationData;
};

const roundNumber = (value: number, dec = 2): number => {
  return Math.round(value * Math.pow(10, dec)) / Math.pow(10, dec);
};
