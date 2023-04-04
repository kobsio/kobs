import { render } from '@testing-library/react';

import AggregationChart from './AggregationChart';

describe('AggregationChart', () => {
  it('renders the pie chart', async () => {
    const result = render(
      <AggregationChart
        options={{
          chart: 'pie',
          sizeByField: '',
          sizeByOperation: 'count',
          sliceBy: 'app',
        }}
        data={{
          columns: ['app', 'count_data'],
          rows: [
            { app: 'foo', count_data: 128 },
            { app: 'bar', count_data: 64 },
          ],
        }}
      />,
    );

    expect(result.queryAllByRole('presentation')).toBeDefined();
  });

  it('renders the bar chart', async () => {
    const result = render(
      <AggregationChart
        options={{
          breakDownByFields: ['app'],
          breakDownByFilters: [],
          chart: 'bar',
          horizontalAxisOperation: 'time',
          verticalAxisField: '',
          verticalAxisOperation: 'count',
        }}
        data={{
          columns: ['time', 'app', 'count_data'],
          rows: [
            { app: 'foo', count_data: 128, time: new Date().toISOString() },
            { app: 'bar', count_data: 64, time: new Date().toISOString() },
          ],
        }}
      />,
    );

    expect(result.queryAllByRole('presentation')).toBeDefined();
  });

  it('renders the top bar chart', async () => {
    const result = render(
      <AggregationChart
        options={{
          breakDownByFields: ['app'],
          breakDownByFilters: [],
          chart: 'bar',
          horizontalAxisField: 'app',
          horizontalAxisLimit: '100',
          horizontalAxisOperation: 'top',
          horizontalAxisOrder: 'ascending',
          verticalAxisField: '',
          verticalAxisOperation: 'count',
        }}
        data={{
          columns: ['time', 'app', 'count_data'],
          rows: [
            { app: 'foo', count_data: 128 },
            { app: 'bar', count_data: 64 },
          ],
        }}
      />,
    );

    expect(result.queryAllByRole('presentation')).toBeDefined();
  });

  it('renders the line chart', async () => {
    const result = render(
      <AggregationChart
        options={{
          breakDownByFields: ['app'],
          breakDownByFilters: [],
          chart: 'line',
          horizontalAxisOperation: 'time',
          verticalAxisField: '',
          verticalAxisOperation: 'count',
        }}
        data={{
          columns: ['time', 'app', 'count_data'],
          rows: [
            { app: 'foo', count_data: 128, time: new Date().toISOString() },
            { app: 'bar', count_data: 64, time: new Date().toISOString() },
          ],
        }}
      />,
    );

    expect(result.queryAllByRole('presentation')).toBeDefined();
  });

  it('renders the area chart', async () => {
    const result = render(
      <AggregationChart
        options={{
          breakDownByFields: ['app'],
          breakDownByFilters: [],
          chart: 'area',
          horizontalAxisOperation: 'time',
          verticalAxisField: '',
          verticalAxisOperation: 'count',
        }}
        data={{
          columns: ['time', 'app', 'count_data'],
          rows: [
            { app: 'foo', count_data: 128, time: new Date().toISOString() },
            { app: 'bar', count_data: 64, time: new Date().toISOString() },
          ],
        }}
      />,
    );

    expect(result.queryAllByRole('presentation')).toBeDefined();
  });
});
