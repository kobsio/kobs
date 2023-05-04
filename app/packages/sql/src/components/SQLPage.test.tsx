import { APIClient, APIContext, QueryClientProvider } from '@kobsio/core';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import SQLPage from './SQLPage';

describe('SQLPage', () => {
  it('should render SQLPage', async () => {
    const apiClient = new APIClient();
    const getSpy = vi.spyOn(apiClient, 'get');
    const instance = {
      cluster: 'cluster',
      description: 'my custom description',
      id: 'id',
      name: 'name',
      type: 'type',
    };

    getSpy.mockImplementation(async (path: string) => {
      if (path === '/api/plugins/sql/meta') {
        return { completions: { bar: ['foo'] }, dialect: 'sql' };
      }
      if (path.startsWith('/api/plugins/sql/query')) {
        return { columns: ['foo'], rows: [{ foo: 'first item' }, { foo: 'second item' }] };
      }

      throw new Error(`mock was called with ${path}`);
    });

    render(
      <MemoryRouter initialEntries={[`/?query=${encodeURIComponent('SELECT * FROM bar;')}`]}>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: apiClient, getUser: vi.fn() }}>
            <SQLPage instance={instance} />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText(instance.description)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('first item')).toBeInTheDocument();
      expect(screen.getByText('second item')).toBeInTheDocument();
    });
  });
});
