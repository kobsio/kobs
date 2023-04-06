import { APIClient, APIContext, QueryClientProvider } from '@kobsio/core';
import { render as _render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import Panel from './Panel';
import { IChartPanelOptions, ISQLData, ITablePanelOptions } from './types';

describe('Panel', () => {
  const instance = {
    cluster: 'cluster',
    description: 'my custom description',
    id: 'id',
    name: 'name',
    type: 'type',
  };

  const apiClient = new APIClient();
  const getSpy = vi.spyOn(apiClient, 'get');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (title: string, panelOptions: any) => {
    _render(
      <QueryClientProvider>
        <APIContext.Provider value={{ client: apiClient, getUser: vi.fn() }}>
          <Panel
            options={panelOptions}
            instance={instance}
            setTimes={vi.fn()}
            times={{ time: 'last15Minutes', timeEnd: 1, timeStart: 0 }}
            title={title}
          />
        </APIContext.Provider>
      </QueryClientProvider>,
    );
  };

  it('should render Panel with table view', async () => {
    getSpy.mockResolvedValueOnce({
      columns: ['foo'],
      rows: [{ foo: 'first item' }, { foo: 'second item' }],
    } as ISQLData);

    render('my table panel', {
      queries: [{ columns: { foo: { title: 'foo', unit: '' } }, name: 'foobar', query: 'SELECT * FROM bar;' }],
      type: 'table',
    } as ITablePanelOptions);

    expect(screen.getByText('my table panel')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('first item')).toBeInTheDocument();
      expect(screen.getByText('second item')).toBeInTheDocument();
    });
  });

  it('should render Panel with singlestat chart', async () => {
    getSpy.mockResolvedValueOnce({
      columns: ['p50', 'p95', 'p99', 'other'],
      rows: [{ other: 16.05, p50: 2.99, p95: 4.31, p99: 16.05 }],
    } as ISQLData);
    render('singlestat chart', {
      chart: {
        legend: { p50: 'P50', p95: 'P95', p99: 'P99' },
        query: 'SELECT 2.99 AS p50, 4.31 AS p95, 16.05 AS p99, 16.05 AS other;',
        thresholds: {
          '-1024': '#3E8635',
          '4': '#F0AB00',
          '6': '#C9190B',
        },
        type: 'singlestat',
        yAxisColumns: ['p50', 'p95', 'p99'],
        yAxisUnit: 'ms',
      },
      type: 'chart',
    } as IChartPanelOptions);
    expect(screen.getByText('singlestat chart')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('P50')).toBeInTheDocument();
      expect(screen.getByText('P95')).toBeInTheDocument();
      expect(screen.getByText('P99')).toBeInTheDocument();

      expect(screen.getByText('2.99 ms')).toBeInTheDocument();
      expect(screen.getByText('4.31 ms')).toBeInTheDocument();
      expect(screen.getByText('16.05 ms')).toBeInTheDocument();
    });
  });

  it('should render Panel with pie chart', async () => {
    getSpy.mockResolvedValueOnce({
      columns: ['y', 'x'],
      rows: [
        { x: 'bucket 0', y: 51 },
        { x: 'bucket 1', y: 77 },
        { x: 'bucket 2', y: 31 },
      ],
    } as ISQLData);
    render('pie chart', {
      chart: {
        pieLabelColumn: 'x',
        pieValueColumn: 'y',
        query: "SELECT randUniform(0, 128) as y, concat('bucket ', toString(number)) AS x FROM numbers(3)",
        type: 'pie',
      },
      type: 'chart',
    } as IChartPanelOptions);
    expect(screen.getByText('pie chart')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryAllByRole('presentation').length).toBeGreaterThan(0);
    });
  });

  it('should render Panel with line chart', async () => {
    getSpy.mockResolvedValueOnce({
      columns: ['p50', 'p95', 'p99', 'time'],
      rows: [
        { p50: 2.69, p95: 8.07, p99: 39.98, time: '2023-04-04T08:03:23Z' },
        { p50: 2.94, p95: 2.96, p99: 45.39, time: '2023-04-04T08:13:23Z' },
        { p50: 4.76, p95: 14.51, p99: 18.2, time: '2023-04-04T08:23:23Z' },
        { p50: 1.51, p95: 4.32, p99: 22.27, time: '2023-04-04T08:33:23Z' },
        { p50: 0.6, p95: 19.64, p99: 9.29, time: '2023-04-04T08:43:23Z' },
      ],
    } as ISQLData);
    render('line chart', {
      chart: {
        legend: { p50: 'P50', p95: 'P95', p99: 'P99' },
        query:
          'SELECT floor(randUniform(0, 5), 2) AS p50, floor(randUniform(0, 20), 2) AS p95, floor(randUniform(0, 50), 2) AS p99, FROM_UNIXTIME(1680595403 + number * 600) AS time FROM numbers(16)',
        type: 'line',
        xAxisColumn: 'time',
        xAxisType: 'time',
        yAxisColumns: ['p50', 'p95', 'p99'],
        yAxisUnit: 'ms',
      },
      type: 'chart',
    } as IChartPanelOptions);
    expect(screen.getByText('line chart')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('P50')).toBeInTheDocument();
      expect(screen.getByText('P95')).toBeInTheDocument();
      expect(screen.getByText('P99')).toBeInTheDocument();
      expect(screen.queryAllByRole('presentation').length).toBeGreaterThan(0);
    });
  });

  it('should render Panel with bar chart', async () => {
    getSpy.mockResolvedValueOnce({
      columns: ['p50', 'p95', 'p99', 'time'],
      rows: [
        { p50: 2.69, p95: 8.07, p99: 39.98, time: '2023-04-04T08:03:23Z' },
        { p50: 2.94, p95: 2.96, p99: 45.39, time: '2023-04-04T08:13:23Z' },
        { p50: 4.76, p95: 14.51, p99: 18.2, time: '2023-04-04T08:23:23Z' },
        { p50: 1.51, p95: 4.32, p99: 22.27, time: '2023-04-04T08:33:23Z' },
        { p50: 0.6, p95: 19.64, p99: 9.29, time: '2023-04-04T08:43:23Z' },
      ],
    } as ISQLData);
    render('bar chart', {
      chart: {
        legend: { p50: 'P50', p95: 'P95', p99: 'P99' },
        query:
          'SELECT floor(randUniform(0, 5), 2) AS p50, floor(randUniform(0, 20), 2) AS p95, floor(randUniform(0, 50), 2) AS p99, FROM_UNIXTIME(1680595403 + number * 600) AS time FROM numbers(16)',
        type: 'bar',
        xAxisColumn: 'time',
        xAxisType: 'time',
        yAxisColumns: ['p50', 'p95', 'p99'],
        yAxisUnit: 'ms',
      },
      type: 'chart',
    } as IChartPanelOptions);
    expect(screen.getByText('bar chart')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('P50')).toBeInTheDocument();
      expect(screen.getByText('P95')).toBeInTheDocument();
      expect(screen.getByText('P99')).toBeInTheDocument();
      expect(screen.queryAllByRole('presentation').length).toBeGreaterThan(0);
    });
  });

  it('should render Panel with area chart', async () => {
    getSpy.mockResolvedValueOnce({
      columns: ['p50', 'p95', 'p99', 'time'],
      rows: [
        { p50: '2.69', p95: '8.07', p99: '39.98', time: '2023-04-04T08:03:23Z' },
        { p50: '2.94', p95: '2.96', p99: '45.39', time: '2023-04-04T08:13:23Z' },
        { p50: '4.76', p95: '14.51', p99: '18.2', time: '2023-04-04T08:23:23Z' },
        { p50: '1.51', p95: '4.32', p99: '22.27', time: '2023-04-04T08:33:23Z' },
        { p50: '0.6', p95: '19.64', p99: '9.29', time: '2023-04-04T08:43:23Z' },
      ],
    } as ISQLData);
    render('area chart', {
      chart: {
        legend: { p50: 'P50', p95: 'P95', p99: 'P99' },
        query:
          'SELECT floor(randUniform(0, 5), 2) AS p50, floor(randUniform(0, 20), 2) AS p95, floor(randUniform(0, 50), 2) AS p99, FROM_UNIXTIME(1680595403 + number * 600) AS time FROM numbers(16)',
        type: 'area',
        xAxisColumn: 'time',
        xAxisType: 'time',
        yAxisColumns: ['p50', 'p95', 'p99'],
        yAxisUnit: 'ms',
      },
      type: 'chart',
    } as IChartPanelOptions);
    expect(screen.getByText('area chart')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('P50')).toBeInTheDocument();
      expect(screen.getByText('P95')).toBeInTheDocument();
      expect(screen.getByText('P99')).toBeInTheDocument();
      expect(screen.queryAllByRole('presentation').length).toBeGreaterThan(0);
    });
  });

  it('should render stacked chart', async () => {
    getSpy.mockResolvedValueOnce({
      columns: ['p50', 'p95', 'p99', 'time'],
      rows: [
        { p50: 2.69, p95: 8.07, p99: 39.98, time: '2023-04-04T08:03:23Z' },
        { p50: 2.94, p95: 2.96, p99: 45.39, time: '2023-04-04T08:13:23Z' },
        { p50: 4.76, p95: 14.51, p99: 18.2, time: '2023-04-04T08:23:23Z' },
        { p50: 1.51, p95: 4.32, p99: 22.27, time: '2023-04-04T08:33:23Z' },
        { p50: 0.6, p95: 19.64, p99: 9.29, time: '2023-04-04T08:43:23Z' },
      ],
    } as ISQLData);
    render('stacked bar chart', {
      chart: {
        legend: { p50: 'P50', p95: 'P95', p99: 'P99' },
        query:
          'SELECT floor(randUniform(0, 5), 2) AS p50, floor(randUniform(0, 20), 2) AS p95, floor(randUniform(0, 50), 2) AS p99, FROM_UNIXTIME(1680595403 + number * 600) AS time FROM numbers(16)',
        type: 'bar',
        xAxisColumn: 'time',
        xAxisType: 'time',
        yAxisColumns: ['p50', 'p95', 'p99'],
        yAxisStacked: true,
        yAxisUnit: 'ms',
      },
      type: 'chart',
    } as IChartPanelOptions);
    expect(screen.getByText('stacked bar chart')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('P50')).toBeInTheDocument();
      expect(screen.getByText('P95')).toBeInTheDocument();
      expect(screen.getByText('P99')).toBeInTheDocument();
      expect(screen.queryAllByRole('presentation').length).toBeGreaterThan(0);
    });
  });

  it('should render grouped chart', async () => {
    getSpy.mockResolvedValueOnce({
      columns: ['p50', 'p95', 'p99', 'time'],
      rows: [
        { group: 'a', p50: 2.69, p95: 8.07, p99: 39.98, time: '2023-04-04T08:03:23Z' },
        { group: 'a', p50: 2.94, p95: 2.96, p99: 45.39, time: '2023-04-04T08:13:23Z' },
        { group: 'b', p50: 4.76, p95: 14.51, p99: 18.2, time: '2023-04-04T08:23:23Z' },
        { group: 'b', p50: 1.51, p95: 4.32, p99: 22.27, time: '2023-04-04T08:33:23Z' },
        { group: 'b', p50: 0.6, p95: 19.64, p99: 9.29, time: '2023-04-04T08:43:23Z' },
      ],
    } as ISQLData);
    render('grouped bar chart', {
      chart: {
        query:
          'SELECT floor(randUniform(0, 5), 2) AS p50, floor(randUniform(0, 20), 2) AS p95, floor(randUniform(0, 50), 2) AS p99, FROM_UNIXTIME(1680595403 + number * 600) AS time FROM numbers(16)',
        type: 'bar',
        xAxisColumn: 'time',
        xAxisType: 'time',
        yAxisColumns: ['p50', 'p95', 'p99'],
        yAxisGroup: 'group',
        yAxisUnit: 'ms',
      },
      type: 'chart',
    } as IChartPanelOptions);
    expect(screen.getByText('grouped bar chart')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('p50-a')).toBeInTheDocument();
      expect(screen.getByText('p95-a')).toBeInTheDocument();
      expect(screen.getByText('p99-a')).toBeInTheDocument();
      expect(screen.getByText('p50-b')).toBeInTheDocument();
      expect(screen.getByText('p95-b')).toBeInTheDocument();
      expect(screen.getByText('p99-b')).toBeInTheDocument();
      expect(screen.queryAllByRole('presentation').length).toBeGreaterThan(0);
    });
  });

  it('should render error when no options are passed', () => {
    render('invalid type', undefined);

    expect(screen.getByText(`Options for SQL panel are missing`)).toBeInTheDocument();
  });

  it('should render error when option.type is unknown', () => {
    render('invalid type', {
      type: 'unknown',
    });

    expect(screen.getByText(`Unknown "type" in configuration`)).toBeInTheDocument();
  });

  it('should render error when table options are invalid', () => {
    render('invalid type', {
      queries: [1, 'hello'],
      type: 'table',
    });

    expect(screen.getByText(`Please provide a valid "queries" property.`)).toBeInTheDocument();
  });

  it('should render error when table options are invalid', () => {
    render('invalid type', {
      chart: {
        type: 'unknown',
      },
      type: 'chart',
    });

    expect(screen.getByText(`Please provide a valid "chart" property.`)).toBeInTheDocument();
  });
});
