import { Serie } from '@nivo/line';

import { IPieDatum, IQueryResult } from '../components/costmanagement/interfaces';
import { IMetric } from './interfaces';
import { formatTime as formatTimeCore } from '@kobsio/plugin-core';

// getResourceGroupFromID returns the resource group name from a given Azure ID. For that we are splitting the ID by "/"
// and looking for the resourceGroups parameter. Then the next parameter must be the name of the resource group. If the
// ID isn't available we return an empty string.
export const getResourceGroupFromID = (id: string): string => {
  const parts = id.split('/');

  let index = parts.indexOf('resourceGroups');
  if (index === -1) {
    index = parts.indexOf('resourcegroups');
  }

  if (index > -1 && parts.length >= index + 1) {
    return parts[index + 1];
  }

  return '';
};

// formatTime is a wrapper around the formatTime function from the core package, which is needed because the time is
// returned as string and not as timestamp from Azure.
export const formatTime = (time: string): string => {
  return formatTimeCore(Math.floor(new Date(time).getTime() / 1000));
};

// formatAxisBottom calculates the format for the bottom axis based on the specified start and end time.
export const formatAxisBottom = (timeStart: number, timeEnd: number): string => {
  timeStart = Math.floor(timeStart);
  timeEnd = Math.floor(timeEnd);

  if (timeEnd - timeStart < 3600) {
    return '%H:%M:%S';
  } else if (timeEnd - timeStart < 86400) {
    return '%H:%M';
  } else if (timeEnd - timeStart < 604800) {
    return '%m-%d %H:%M';
  }

  return '%m-%d';
};

// convertMetric returns the metric from the Azure API in the format required for nivo charts.
export const convertMetric = (metric: IMetric): Serie[] => {
  const series: Serie[] = [];

  for (let i = 0; i < metric.timeseries.length; i++) {
    series.push({
      data: metric.timeseries[i].data.map((datum) => {
        return { x: new Date(datum.timeStamp), y: datum.average === undefined ? null : datum.average };
      }),
      id: `${i + 1}. ${metric.name.localizedValue}`,
    });
  }

  return series;
};

// convertQueryResult returns the cost management query result in the format required for nivo pie canvas.
export const convertQueryResult = (data: IQueryResult): IPieDatum[] => {
  const pieData: IPieDatum[] = [];

  for (let i = 0; i < data.properties.rows.length; i++) {
    pieData.push({
      id: data.properties.rows[i][1],
      label: data.properties.rows[i][1],
      value: data.properties.rows[i][0],
    });
  }

  return pieData;
};

// formatMetric is used to auto format the values of a metric. When the unit of a metric is "Bytes" we auto format the
// values to KB, MB, GB, etc.
export const formatMetric = (metric: IMetric): IMetric => {
  // If the unit isn't "Bytes" we use the metric as it was returned by the Azure API.
  if (metric.unit !== 'Bytes') {
    return metric;
  }

  // In the first step we have to determine the minimum and maximum value of all the returned timeseries in the metric,
  let min = 0;
  let max = 0;

  for (let i = 0; i < metric.timeseries.length; i++) {
    for (let j = 0; j < metric.timeseries[i].data.length; j++) {
      const average = metric.timeseries[i].data[j].average;

      if (i === 0 && j === 0 && average !== undefined) {
        min = average;
        max = average;
      }

      if (average !== undefined && average < min) {
        min = average;
      }

      if (average !== undefined && average > max) {
        max = average;
      }
    }
  }

  // Now we are using the maximum value to get the exponent. If the exponent is 0 we can directly return the metric,
  // because the given unit ("Bytes") fits very well. If the exponent is larger then 8 we use 8 as exponent, because YB
  // is the largest unit we can display.
  let exponent = Math.floor(Math.log(max) / Math.log(1024));

  if (exponent === 0) {
    return metric;
  }

  if (exponent > 8) {
    exponent = 8;
  }

  // Now we have to loop again through all data points to format all the values. After that we set the new unit based on
  // the exponent so that we can return the metric.
  for (let i = 0; i < metric.timeseries.length; i++) {
    for (let j = 0; j < metric.timeseries[i].data.length; j++) {
      const average = metric.timeseries[i].data[j].average;

      if (average !== undefined) {
        metric.timeseries[i].data[j].average = average / Math.pow(1024, exponent);
      }
    }
  }

  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  metric.unit = sizes[exponent];

  return metric;
};
