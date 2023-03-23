import { APIClient, APIContext, QueryClientProvider } from '@kobsio/core';
import { render as _render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import LogsPanel from './LogsPanel';

import { ILogsData } from '../common/types';

vi.mock('../page/LogsBucketChart', () => {
  return {
    default: () => {
      return <>mock bucket chart</>;
    },
  };
});

describe('LogsPanel', () => {
  const apiClient = new APIClient();
  const getSpy = vi.spyOn(apiClient, 'get');

  // disable the rule, because the tests must be able to pass invalid objects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = async (options: any) => {
    return _render(
      <QueryClientProvider>
        <APIContext.Provider value={{ client: apiClient, getUser: vi.fn() }}>
          <LogsPanel
            options={options}
            instance={{ cluster: 'cluster', id: 'id', name: 'name', type: 'type' }}
            setTimes={vi.fn()}
            times={{ time: 'last15Minutes', timeEnd: 1, timeStart: 0 }}
            title="my panel"
          />
        </APIContext.Provider>
      </QueryClientProvider>,
    );
  };

  const data: ILogsData = {
    count: 1,
    documents: [
      {
        app: 'my-app-name',
        timestamp: new Date().toISOString(),
      },
    ],
    offset: 0,
    timeStart: 0,
    took: 1,
  };

  it('should render the panel', async () => {
    getSpy.mockResolvedValueOnce(data);
    await render({ queries: [{ fields: ['app'], name: 'my-query', query: "namespace='kube-system'" }] });
    await waitFor(() => expect(screen.getByText(/\d+ documents in \d+ milliseconds/)).toBeInTheDocument());
    expect(screen.getByText('my panel')).toBeInTheDocument();
    expect(screen.getByText('my-app-name')).toBeInTheDocument();
  });

  it('should render tabs, when multiple queries are given', async () => {
    getSpy.mockResolvedValueOnce(data);
    await render({
      queries: [
        { fields: ['app'], name: 'my-query', query: "namespace='kube-system'" },
        { fields: ['foo'], name: 'my-other-query', query: "namespace='foo'" },
      ],
    });
    await waitFor(() => expect(screen.getByText(/\d+ documents in \d+ milliseconds/)).toBeInTheDocument());
    expect(screen.getByText('my-query')).toBeInTheDocument();
    expect(screen.getByText('my-other-query')).toBeInTheDocument();
  });

  it('should render error message when queries is not an array', async () => {
    await render({ queries: { fields: ['app'], name: 'my-query', query: "namespace='kube-system'" } });
    expect(screen.getByText('Invalid options for KLogs plugin')).toBeInTheDocument();
  });

  it('should render error message when queries[*].fields is not an array', async () => {
    await render({ queries: [{ fields: 1, name: 'my-query', query: "namespace='kube-system'" }] });
    expect(screen.getByText('Invalid options for KLogs plugin')).toBeInTheDocument();
  });

  it('should render error message when queries[*].name is not of type string', async () => {
    await render({ queries: [{ fields: ['app'], name: 1, query: "namespace='kube-system'" }] });
    expect(screen.getByText('Invalid options for KLogs plugin')).toBeInTheDocument();
  });

  it('should render error message when queries[*].query is not of type string', async () => {
    await render({ queries: [{ fields: ['app'], name: 'name', query: null }] });
    expect(screen.getByText('Invalid options for KLogs plugin')).toBeInTheDocument();
  });
});
