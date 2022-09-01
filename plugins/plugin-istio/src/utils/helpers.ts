import { getTimeParams } from '@kobsio/shared';

import { IApplicationOptions, IApplicationsOptions, ITopDetailsMetrics } from './interfaces';

// getInitialApplicationsOptions is used to get the initial Istio options from the url.
export const getInitialApplicationsOptions = (search: string, isInitial: boolean): IApplicationsOptions => {
  const params = new URLSearchParams(search);
  const namespaces = params.getAll('namespace');

  return {
    namespaces: namespaces.length > 0 ? namespaces : [],
    times: getTimeParams(params, isInitial),
  };
};

// getInitialApplicationOptions is used to get the initial Istio options from the url.
export const getInitialApplicationOptions = (search: string, isInitial: boolean): IApplicationOptions => {
  const params = new URLSearchParams(search);
  const view = params.get('view');
  const filterUpstreamCluster = params.get('filterUpstreamCluster');
  const filterMethod = params.get('filterMethod');
  const filterPath = params.get('filterPath');

  return {
    filters: {
      method: filterMethod ? filterMethod : '',
      path: filterPath ? filterPath : '',
      upstreamCluster: filterUpstreamCluster ? filterUpstreamCluster : '',
    },
    times: getTimeParams(params, isInitial),
    view: view ? view : 'metrics',
  };
};

// formatNumber brings the given value returned by Prometheus as string into a format we can use in our ui.
export const formatNumber = (value: string, unit = '', dec = 4): string => {
  if (value === 'NaN' || value === '') {
    return '-';
  }

  return formatParsedNumber(parseFloat(value), unit, dec);
};

export const formatParsedNumber = (value: number, unit = '', dec = 4): string => {
  return `${Math.round(value * Math.pow(10, dec)) / Math.pow(10, dec)} ${unit}`;
};

export const getDirection = (upstreamCluster: string): string => {
  if (upstreamCluster.startsWith('inbound')) {
    return 'INBOUND';
  } else if (upstreamCluster.startsWith('outbound')) {
    return 'OUTBOUND';
  }

  return '-';
};

// formatTime formate the given time string. We do not use the formatTime function from the core package, because we
// also want to include milliseconds in the logs timestamp, which we show.
export const formatTime = (time: string): string => {
  const d = new Date(time);
  return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)} ${(
    '0' + d.getHours()
  ).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}:${('0' + d.getSeconds()).slice(-2)}.${(
    '00' + d.getMilliseconds()
  ).slice(-3)}`;
};

// convertMetrics converts the returned top metrics from our API into the format needed for the charts.
export const convertMetrics = (rows: [string, number, number, number, number, number][]): ITopDetailsMetrics => {
  const sr: { x: Date; y: number }[] = [];
  const p50: { x: Date; y: number }[] = [];
  const p90: { x: Date; y: number }[] = [];
  const p99: { x: Date; y: number }[] = [];

  for (const row of rows) {
    const d = new Date(row[0]);
    sr.push({ x: d, y: row[2] });
    p50.push({ x: d, y: row[3] });
    p90.push({ x: d, y: row[4] });
    p99.push({ x: d, y: row[5] });
  }

  return {
    latency: [
      { data: p50, name: 'P50' },
      { data: p90, name: 'P90' },
      { data: p99, name: 'P99' },
    ],
    sr: [{ data: sr, name: 'SR' }],
  };
};

export const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
