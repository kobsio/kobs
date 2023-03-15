import { APIClient, APIContext, QueryClientProvider } from '@kobsio/core';
import { render as _render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import LogsPage from './LogsPage';

import { ILogsData } from '../common/types';

vi.mock('./LogsBucketChart', () => {
  return {
    default: () => {
      return <>mock bucket chart</>;
    },
  };
});

vi.mock('./InternalEditor', () => {
  return {
    default: () => {
      return <>mock editor</>;
    },
  };
});

describe('LogsPage', () => {
  const apiClient = new APIClient();
  const getSpy = vi.spyOn(apiClient, 'get');

  const render = async () => {
    const renderResult = _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: apiClient, getUser: vi.fn() }}>
            <LogsPage instance={{ cluster: 'cluster', id: 'id', name: 'name', type: 'type' }} />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText(/\d+ documents in \d+ milliseconds/)).toBeInTheDocument());

    return renderResult;
  };

  it('should render the plugin page', async () => {
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
    getSpy.mockResolvedValueOnce(data);
    await render();
    expect(
      screen.getByText(/Fast, scalable and reliable logging using Fluent Bit and ClickHouse\./),
    ).toBeInTheDocument();
    expect(screen.getByText('my-app-name')).toBeInTheDocument();
  });
});
