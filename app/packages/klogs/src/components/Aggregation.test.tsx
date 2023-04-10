import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { Aggregation } from './Aggregation';

import { IAggregationOptions } from '../utils/aggregation';

const defaultOptions: IAggregationOptions = {
  breakDownByFields: [],
  breakDownByFilters: [],
  chart: 'pie',
  horizontalAxisField: '',
  horizontalAxisLimit: 10,
  horizontalAxisOperation: 'time',
  horizontalAxisOrder: 'ascending',
  query: '',
  sizeByField: '',
  sizeByOperation: 'count',
  sliceBy: '',
  time: 'last15Minutes',
  timeEnd: Math.floor(Date.now() / 1000),
  timeStart: Math.floor(Date.now() / 1000) - 900,
  verticalAxisField: '',
  verticalAxisOperation: 'count',
};

describe('Aggregation', () => {
  const render = (options: IAggregationOptions, data: unknown): RenderResult => {
    const client = new APIClient();
    const postSpy = vi.spyOn(client, 'post');
    postSpy.mockResolvedValue(data);

    return _render(
      <QueryClientProvider>
        <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
          <Aggregation
            instance={{
              cluster: 'hub',
              id: '/cluster/hub/type/klogs/name/klogs',
              name: 'klogs',
              type: 'klogs',
            }}
            options={options}
            setTimes={vi.fn()}
          />
        </APIContext.Provider>
      </QueryClientProvider>,
    );
  };

  it('should render the pie chart', async () => {
    render(
      {
        ...defaultOptions,
        chart: 'pie',
        sizeByField: '',
        sizeByOperation: 'count',
        sliceBy: 'app',
      },
      {
        columns: ['app', 'count_data'],
        rows: [
          { app: 'foo', count_data: 128 },
          { app: 'bar', count_data: 64 },
        ],
      },
    );

    expect(await waitFor(() => screen.getByTestId('klogs-pie-chart'))).toBeInTheDocument();
  });

  it('should render the bar chart', async () => {
    render(
      {
        ...defaultOptions,
        breakDownByFields: ['app'],
        breakDownByFilters: [],
        chart: 'bar',
        horizontalAxisOperation: 'time',
        verticalAxisField: '',
        verticalAxisOperation: 'count',
      },
      {
        columns: ['time', 'app', 'count_data'],
        rows: [
          { app: 'foo', count_data: 128, time: new Date().toISOString() },
          { app: 'bar', count_data: 64, time: new Date().toISOString() },
        ],
      },
    );

    expect(await waitFor(() => screen.getByTestId('klogs-timeseries-chart'))).toBeInTheDocument();
  });

  it('should render the top bar chart', async () => {
    render(
      {
        ...defaultOptions,
        breakDownByFields: ['app'],
        breakDownByFilters: [],
        chart: 'bar',
        horizontalAxisField: 'app',
        horizontalAxisLimit: 100,
        horizontalAxisOperation: 'top',
        horizontalAxisOrder: 'ascending',
        verticalAxisField: '',
        verticalAxisOperation: 'count',
      },
      {
        columns: ['time', 'app', 'count_data'],
        rows: [
          { app: 'foo', count_data: 128 },
          { app: 'bar', count_data: 64 },
        ],
      },
    );

    expect(await waitFor(() => screen.getByTestId('klogs-top-chart'))).toBeInTheDocument();
  });

  it('should render the line chart', async () => {
    render(
      {
        ...defaultOptions,
        breakDownByFields: ['app'],
        breakDownByFilters: [],
        chart: 'line',
        horizontalAxisOperation: 'time',
        verticalAxisField: '',
        verticalAxisOperation: 'count',
      },
      {
        columns: ['time', 'app', 'count_data'],
        rows: [
          { app: 'foo', count_data: 128, time: new Date().toISOString() },
          { app: 'bar', count_data: 64, time: new Date().toISOString() },
        ],
      },
    );

    expect(await waitFor(() => screen.getByTestId('klogs-timeseries-chart'))).toBeInTheDocument();
  });

  it('should render the area chart', async () => {
    render(
      {
        ...defaultOptions,
        breakDownByFields: ['app'],
        breakDownByFilters: [],
        chart: 'area',
        horizontalAxisOperation: 'time',
        verticalAxisField: '',
        verticalAxisOperation: 'count',
      },
      {
        columns: ['time', 'app', 'count_data'],
        rows: [
          { app: 'foo', count_data: 128, time: new Date().toISOString() },
          { app: 'bar', count_data: 64, time: new Date().toISOString() },
        ],
      },
    );

    expect(await waitFor(() => screen.getByTestId('klogs-timeseries-chart'))).toBeInTheDocument();
  });

  it('should render error that slice by is required', async () => {
    render({ ...defaultOptions, chart: 'pie', sliceBy: '' }, { columns: [], rows: [] });
    expect(await waitFor(() => screen.getByText('"Slice by" is required'))).toBeInTheDocument();
  });

  it('should render error that horizontal axis field is required', async () => {
    render({ ...defaultOptions, chart: 'bar', horizontalAxisOperation: 'top' }, { columns: [], rows: [] });
    expect(await waitFor(() => screen.getByText('"Horizontal axis field" is required'))).toBeInTheDocument();
  });

  it('should render error that horizontal axis limit is required', async () => {
    render(
      {
        ...defaultOptions,
        chart: 'bar',
        horizontalAxisField: 'test',
        horizontalAxisLimit: 0,
        horizontalAxisOperation: 'top',
      },
      { columns: [], rows: [] },
    );
    expect(
      await waitFor(() => screen.getByText('"Horizontal axis limit" is required and must be a number')),
    ).toBeInTheDocument();
  });

  it('should render error that horizontal axis operation is required', async () => {
    render({ ...defaultOptions, chart: 'bar', horizontalAxisOperation: '' }, { columns: [], rows: [] });
    expect(await waitFor(() => screen.getByText('"Horizontal axis operation" is required'))).toBeInTheDocument();
  });

  it('should render error that vertical axis field is required', async () => {
    render(
      { ...defaultOptions, chart: 'bar', horizontalAxisOperation: 'time', verticalAxisOperation: 'min' },
      { columns: [], rows: [] },
    );
    expect(await waitFor(() => screen.getByText('"Vertical axis field" is required'))).toBeInTheDocument();
  });
});
