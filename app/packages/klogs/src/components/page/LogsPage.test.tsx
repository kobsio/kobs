import { APIClient, APIContext, QueryClientProvider } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import LogsPage from './LogsPage';

vi.mock('./LogsToolbar', () => {
  return {
    default: () => {
      return <>mocked toolbar</>;
    },
  };
});

describe('LogsPage', () => {
  const render = (): RenderResult => {
    const apiClient = new APIClient();
    const getSpy = vi.spyOn(apiClient, 'get');
    getSpy.mockResolvedValueOnce({
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
    });

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: apiClient, getUser: vi.fn() }}>
            <LogsPage instance={{ cluster: 'cluster', id: 'id', name: 'name', type: 'type' }} />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render the plugin page', async () => {
    render();
    expect(
      await waitFor(() => screen.getByText(/Fast, scalable and reliable logging using Fluent Bit and ClickHouse\./)),
    ).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/\d+ documents in \d+ milliseconds/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('my-app-name'))).toBeInTheDocument();
  });
});
