import { DatumValue, Serie } from '@nivo/line';

import { ILabels, IMappings, IMetric, IOptions, ISeries } from './interfaces';
import { IPluginTimes, TTime, TTimeOptions } from '@kobsio/plugin-core';

// getOptionsFromSearch is used to parse the given search location and return is as options for Prometheus. This is
// needed, so that a user can explore his Prometheus data from a chart. When the user selects the explore action, we
// pass him to this page and pass the data via the URL parameters.
export const getOptionsFromSearch = (search: string): IOptions => {
  const params = new URLSearchParams(search);
  const queries = params.getAll('query');
  const resolution = params.get('resolution');
  const time = params.get('time');
  const timeEnd = params.get('timeEnd');
  const timeStart = params.get('timeStart');

  return {
    queries: queries.length > 0 ? queries : [''],
    resolution: resolution ? resolution : '',
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

// convertMetrics converts a list of metrics, which is returned by our API into the format which is required by nivo.
// This is necessary, because nivo requires a date object for the x value which can not be returned by our API. The API
// instead returns the corresponding timestamp.
export const convertMetrics = (metrics: IMetric[]): ISeries => {
  const labels: ILabels = {};
  const series: Serie[] = [];

  for (const metric of metrics) {
    labels[metric.id] = metric.label;

    series.push({
      ...metric,
      data: metric.data.map((datum) => {
        return { x: new Date(datum.x), y: datum.y };
      }),
    });
  }

  return {
    labels: labels,
    series: series,
  };
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

// getMappingValue returns the mapping for a given value.
export const getMappingValue = (value: DatumValue | null | undefined, mappings: IMappings): string => {
  if (!value) {
    return '';
  }

  return mappings[value.toString()];
};
