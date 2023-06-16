import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import fixtureLogs from './__fixtures__/logs.json';
import fixtureMetrics from './__fixtures__/metrics.json';
import DatadogPanel from './DatadogPanel';

describe('DatadogPanel', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (options: any): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      if (path.startsWith('/api/plugins/datadog/logs')) {
        return fixtureLogs;
      }

      if (path.startsWith('/api/plugins/datadog/metrics')) {
        return fixtureMetrics;
      }

      return [];
    });

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <DatadogPanel
              title="Test"
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/datadog/name/datadog',
                name: 'datadog',
                type: 'datadog',
              }}
              options={options}
              times={{
                time: 'last15Minutes',
                timeEnd: 0,
                timeStart: 0,
              }}
              setTimes={vi.fn()}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render error on missing options', async () => {
    render(undefined);
    expect(await waitFor(() => screen.getByText('Invalid options for Datadog plugin'))).toBeInTheDocument();
  });

  it('should render single log query', async () => {
    render({ queries: [{ name: 'test', query: '' }], type: 'logs' });
    expect(await waitFor(() => screen.getByText('Read time timeout reached'))).toBeInTheDocument();
  });

  it('should render multiple log queries', async () => {
    render({
      queries: [
        { name: 'my test query 1', query: '' },
        { name: 'my test query 2', query: '' },
      ],
      type: 'logs',
    });

    expect(await waitFor(() => screen.getByText('my test query 1'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('my test query 2'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Read time timeout reached'))).toBeInTheDocument();

    const tab = screen.getByText('my test query 2');
    userEvent.click(tab);

    expect(await waitFor(() => screen.getByText('my test query 1'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('my test query 2'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Read time timeout reached'))).toBeInTheDocument();
  });

  it('should render metrics', async () => {
    render({
      query: 'sum:aws.apigateway.4xxerror{*} by {apiname}.as_count()',
      type: 'metrics',
    });

    expect(await waitFor(() => screen.getByTestId('datadog-metrics-chart'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/apiname:service1/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/apiname:service2/))).toBeInTheDocument();
  });
});
