import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { AuthContextProvider } from './AuthContext';

describe('AuthContext', () => {
  const client = new APIClient();
  const getSpy = vi.spyOn(client, 'get');

  const render = (title: string): RenderResult => {
    return _render(
      <MemoryRouter initialEntries={['/']}>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <AuthContextProvider
              title={title}
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/github/name/github',
                name: 'github',
                type: 'github',
              }}
            >
              <div>mocked component</div>
            </AuthContextProvider>
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render component', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      if (path.startsWith('/api/plugins/github/oauth/login')) {
        return { url: '' };
      }

      if (path.startsWith('/api/plugins/github/oauth')) {
        return {
          organization: 'kobsio',
          token: 'mytoken',
          username: 'ricoberger',
        };
      }

      return;
    });

    render('');
    expect(await waitFor(() => screen.getByText('mocked component'))).toBeInTheDocument();
  });

  it('should render title, error and no login button', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      if (path.startsWith('/api/plugins/github/oauth/login')) {
        return { url: '' };
      }

      if (path.startsWith('/api/plugins/github/oauth')) {
        throw new Error('my error');
      }

      return;
    });

    render('my title');
    expect(await waitFor(() => screen.getByText('my title'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Authentication failed'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('my error'))).toBeInTheDocument();
    expect(screen.queryByText(/LOGIN/)).not.toBeInTheDocument();
  });

  it('should render error and login button', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      if (path.startsWith('/api/plugins/github/oauth/login')) {
        return { url: 'github.com' };
      }

      if (path.startsWith('/api/plugins/github/oauth')) {
        throw new Error('my error');
      }

      return;
    });

    render('');
    expect(await waitFor(() => screen.getByText('Authentication failed'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('my error'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('LOGIN'))).toBeInTheDocument();
  });
});
