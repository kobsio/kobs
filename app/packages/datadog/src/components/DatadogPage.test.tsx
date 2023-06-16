import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import fixtureLogs from './__fixtures__/logs.json';
import fixtureMetrics from './__fixtures__/metrics.json';
import DatadogPage from './DatadogPage';

import { description } from '../utils/utils';

describe('DatadogPage', () => {
  const render = (path: string): RenderResult => {
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
      <MemoryRouter initialEntries={[path]}>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <DatadogPage
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/datadog/name/datadog',
                name: 'datadog',
                type: 'datadog',
              }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render logs', async () => {
    render('/');

    expect(screen.getByText('datadog')).toBeInTheDocument();
    expect(screen.getByText('(hub / datadog)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('Read time timeout reached'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/\d+ Documents/))).toBeInTheDocument();

    const expandButton = screen.getByRole('button', { name: 'expand document' });
    userEvent.click(expandButton);

    expect(await waitFor(() => screen.getByText('Table'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('JSON'))).toBeInTheDocument();

    expect(
      await waitFor(() =>
        screen.getByText(
          'arn:aws:lambda:us-west-2:339389476548:function:datadog-ForwarderStack-BWPIV6V8U194-Forwarder-FS1X0ZB7VPOT',
        ),
      ),
    ).toBeInTheDocument();

    const jsonTab = screen.getByText('JSON');
    userEvent.click(jsonTab);
  });

  it('should render metrics', async () => {
    render('/metrics');

    expect(screen.getByText('datadog')).toBeInTheDocument();
    expect(screen.getByText('(hub / datadog)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByTestId('datadog-metrics-chart'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/apiname:service1/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/apiname:service2/))).toBeInTheDocument();
  });
});
