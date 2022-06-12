import { Serie } from '@nivo/line';

import { ILabels, IMetric, ISeries } from './interfaces';

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

// convertMetrics converts a list of metrics, which is returned by our API into the format which is required by nivo.
// This is necessary, because nivo requires a date object for the x value which can not be returned by our API. The API
// instead returns the corresponding timestamp.
// The startTime and endTime and the min and max values are just passed to the returned ISeries so that we can use it in
// the UI, without maintaining two different objects.
export const convertMetrics = (
  metrics: IMetric[],
  startTime: number,
  endTime: number,
  min: number,
  max: number,
): ISeries => {
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
    endTime: endTime,
    labels: labels,
    max: max,
    min: min,
    series: series,
    startTime: startTime,
  };
};
