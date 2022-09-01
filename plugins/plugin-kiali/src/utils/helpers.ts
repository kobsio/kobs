import { IMetric, INodeData, IOptions, ISerie } from './interfaces';
import { getTimeParams } from '@kobsio/shared';

// getInitialOptions is used to get the initial Kiali options from a url.
export const getInitialOptions = (search: string, isInitial: boolean): IOptions => {
  const params = new URLSearchParams(search);
  const namespaces = params.getAll('namespace');

  return {
    namespaces: namespaces.length > 0 ? namespaces : undefined,
    times: getTimeParams(params, isInitial),
  };
};

export interface ITitle {
  badge: string;
  title: string;
}

// getTitle returns the title of a node for the details view. The title contains a name (title) and a badge, which is
// used to display the node type. The node type can be SE (ServiceEntry), S (Service) or A (Application).
export const getTitle = (node: INodeData): ITitle => {
  if (node.nodeType === 'serviceentry') {
    return { badge: 'SE', title: node.nodeLabel };
  } else if (node.nodeType === 'service') {
    return { badge: 'S', title: node.service || '' };
  }

  return { badge: 'A', title: node.app || '' };
};

// convertMetrics converts the data returned by the Kiali API to an array which we can use in our charting library
// (nivo).
export const convertMetrics = (metrics: IMetric[]): ISerie[] => {
  const series: ISerie[] = [];

  for (const metric of metrics) {
    series.push({
      data: metric.datapoints.map((datum) => {
        return { x: new Date(datum[0] * 1000), y: parseFloat(datum[1]) };
      }),
      name: getMetricLabel(metric),
    });
  }

  return series;
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

export const getSteps = (start: number, end: number): string => {
  const seconds = end - start;

  if (seconds <= 6 * 3600) {
    return '&step=30&rateInterval=30s';
  } else if (seconds <= 12 * 3600) {
    return '&step=60&rateInterval=60s';
  } else if (seconds <= 24 * 3600) {
    return '&step=120&rateInterval=120s';
  } else if (seconds <= 2 * 24 * 3600) {
    return '&step=300&rateInterval=300s';
  } else if (seconds <= 7 * 24 * 3600) {
    return '&step=1800&rateInterval=1800s';
  } else if (seconds <= 30 * 24 * 3600) {
    return '&step=3600&rateInterval=3600s';
  }

  return `&step=${seconds / 1000}&rateInterval=${seconds / 1000}s`;
};
