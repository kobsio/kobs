import { IPieDatum, IQueryResult } from '../components/costmanagement/interfaces';
import { IMetric } from './interfaces';
import { formatTime as formatTimeCore } from '@kobsio/shared';

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

// convertMetrics returns the metrics from the Azure API in the format required for nivo charts.
export const convertMetrics = (
  metrics: IMetric[],
  aggregationType: string,
): { name: string; data: { x: Date; y: number }[] }[] => {
  const series: { name: string; data: { x: Date; y: number }[] }[] = [];

  for (let i = 0; i < metrics.length; i++) {
    for (let j = 0; j < metrics[i].timeseries.length; j++) {
      series.push({
        data: metrics[i].timeseries[j].data.map((datum) => {
          return {
            x: new Date(datum.timeStamp),
            y: datum[aggregationType.toLowerCase()] === undefined ? null : datum[aggregationType.toLowerCase()],
          };
        }),
        name: metrics[i].name.localizedValue,
      });
    }
  }

  return series;
};

// convertQueryResult returns the cost management query result in the format required for nivo pie canvas.
export const convertQueryResult = (data: IQueryResult): IPieDatum[] => {
  const pieData: IPieDatum[] = [];

  for (let i = 0; i < data.properties.rows.length; i++) {
    pieData.push({
      x: data.properties.rows[i][1],
      y: data.properties.rows[i][0],
    });
  }

  return pieData;
};

// formatMetrics is used to auto format the values of all metrics. When the unit of a metric is "Bytes" we auto format
// the values to KB, MB, GB, etc.
export const formatMetrics = (metrics: IMetric[], aggregationType: string): IMetric[] => {
  const formattedMetrics: IMetric[] = [];

  // In the first step we have to determine the minimum and maximum value of all the returned timeseries in the metric,
  let min = 0;
  let max = 0;

  for (const metric of metrics) {
    // If the unit isn't "Bytes" we use the metric as it was returned by the Azure API.
    if (metric.unit !== 'Bytes') {
      return metrics;
    }

    for (let i = 0; i < metric.timeseries.length; i++) {
      for (let j = 0; j < metric.timeseries[i].data.length; j++) {
        const value = metric.timeseries[i].data[j][aggregationType.toLowerCase()];

        if (i === 0 && j === 0 && value !== undefined) {
          min = value;
          max = value;
        }

        if (value !== undefined && value < min) {
          min = value;
        }

        if (value !== undefined && value > max) {
          max = value;
        }
      }
    }
  }

  // Now we are using the maximum value to get the exponent. If the exponent is 0 we can directly return the metric,
  // because the given unit ("Bytes") fits very well. If the exponent is larger then 8 we use 8 as exponent, because YB
  // is the largest unit we can display.
  let exponent = Math.floor(Math.log(max) / Math.log(1024));

  if (exponent === 0) {
    return metrics;
  }

  if (exponent > 8) {
    exponent = 8;
  }

  // Now we have to loop again through all data points to format all the values. After that we set the new unit based on
  // the exponent so that we can return the metric.
  for (const metric of metrics) {
    for (let i = 0; i < metric.timeseries.length; i++) {
      for (let j = 0; j < metric.timeseries[i].data.length; j++) {
        const value = metric.timeseries[i].data[j][aggregationType.toLowerCase()];

        if (value !== undefined) {
          metric.timeseries[i].data[j][aggregationType.toLowerCase()] = value / Math.pow(1024, exponent);
        }
      }
    }

    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    metric.unit = sizes[exponent];
    formattedMetrics.push(metric);
  }

  return formattedMetrics;
};

// roundNumber rounds the given number to a specify number of decimals. The default number of decimals is 4 but can be
// overwritten by the user.
export const roundNumber = (value: number, dec = 2): number => {
  return Math.round(value * Math.pow(10, dec)) / Math.pow(10, dec);
};
