import { Serie } from '@nivo/line';

import { IMetric } from './interfaces';
import { formatTime as formatTimeCore } from '@kobsio/plugin-core';

export const getResourceGroupFromID = (id: string): string => {
  const parts = id.split('/');
  const index = parts.indexOf('resourceGroups');

  if (index > -1 && parts.length >= index + 1) {
    return parts[index + 1];
  }

  return '';
};

export const formatTime = (time: string): string => {
  return formatTimeCore(Math.floor(new Date(time).getTime() / 1000));
};

// formatAxisBottom calculates the format for the bottom axis based on the specified start and end time.
export const formatAxisBottom = (timeStart: number, timeEnd: number): string => {
  timeStart = Math.floor(timeStart / 1000);
  timeEnd = Math.floor(timeEnd / 1000);

  if (timeEnd - timeStart < 3600) {
    return '%H:%M:%S';
  } else if (timeEnd - timeStart < 86400) {
    return '%H:%M';
  } else if (timeEnd - timeStart < 604800) {
    return '%m-%d %H:%M';
  }

  return '%m-%d';
};

// formatMetrics returns the metrics from the Azure API in the format required for nivo charts.
export const formatMetrics = (metrics: IMetric): Serie[] => {
  const series: Serie[] = [];

  if (metrics.timeseries.length === 1) {
    series.push({
      data: metrics.timeseries[0].data.map((datum) => {
        return { x: new Date(datum.timeStamp), y: datum.average === undefined ? null : datum.average };
      }),
      id: 'metric',
    });
  }

  return series;
};
