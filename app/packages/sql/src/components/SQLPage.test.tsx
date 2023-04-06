import { APIClient, APIContext, QueryClientProvider } from '@kobsio/core';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import SQLPage from './SQLPage';

describe('SQLPage', () => {
  it('should render SQLPage', async () => {
    const apiClient = new APIClient();
    render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: apiClient, getUser: vi.fn() }}>
            <SQLPage instance={{ cluster: 'cluster', id: 'id', name: 'name', type: 'type' }} />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  });
});
