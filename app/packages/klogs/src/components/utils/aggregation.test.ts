import { getChartColor } from '@kobsio/core';

import { convertToTimeseriesChartData } from './aggregation';

import { ISeries } from '../page/AggregationTypes';

describe('convertToTimeseriesChartData', () => {
  it('should map the data', () => {
    const data = {
      columns: ['time', 'namespace', 'count_data_filter_0', 'count_data_filter_1'],
      rows: [
        { count_data_filter_0: 8, count_data_filter_1: 16, namespace: 'foo', time: '2023-03-30T07:16:57Z' },
        { count_data_filter_0: 80, count_data_filter_1: 160, namespace: 'bar', time: '2023-03-30T07:17:57Z' },
      ],
    };

    const filter = ["container_name ~ 'grafana'", "container_name ~ 'prometheus'"];

    expect(convertToTimeseriesChartData(data, filter)).toEqual<ISeries[]>([
      {
        data: [
          {
            color: getChartColor(0),
            series: "foo - count - container_name ~ 'grafana'",
            x: new Date(data.rows[0].time),
            y: 8,
          },
        ],
        name: "foo - count - container_name ~ 'grafana'",
      },
      {
        data: [
          {
            color: getChartColor(1),
            series: "foo - count - container_name ~ 'prometheus'",
            x: new Date(data.rows[0].time),
            y: 16,
          },
        ],
        name: "foo - count - container_name ~ 'prometheus'",
      },
      {
        data: [
          {
            color: getChartColor(2),
            series: "bar - count - container_name ~ 'grafana'",
            x: new Date(data.rows[1].time),
            y: 80,
          },
        ],
        name: "bar - count - container_name ~ 'grafana'",
      },
      {
        data: [
          {
            color: getChartColor(3),
            series: "bar - count - container_name ~ 'prometheus'",
            x: new Date(data.rows[1].time),
            y: 160,
          },
        ],
        name: "bar - count - container_name ~ 'prometheus'",
      },
    ]);
  });
});
