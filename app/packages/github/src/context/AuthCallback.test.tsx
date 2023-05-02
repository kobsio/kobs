import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { AuthCallback } from './AuthCallback';

describe('AuthCallback', () => {
  const render = (): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    getSpy.mockResolvedValue({
      organization: 'kobsio',
      token: 'mytoken',
      username: 'ricoberger',
    });

    return _render(
      <MemoryRouter initialEntries={['/?code=mycode&state=mystate']}>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <AuthCallback
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/github/name/github',
                name: 'github',
                type: 'github',
              }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render callback', async () => {
    render();

    expect(await waitFor(() => screen.getByText('Authentication process finished'))).toBeInTheDocument();
    expect(
      await waitFor(() => screen.getByText(/You are now authenticated for the organization kobsio as ricoberger/)),
    ).toBeInTheDocument();
  });
});
