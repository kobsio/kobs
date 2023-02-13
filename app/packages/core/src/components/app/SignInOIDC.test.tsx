import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as _render, screen, RenderResult, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import SigninOIDC from './SignInOIDC';

import Client from '../api/api';
import { APIContext } from '../api/context';

describe('SignInOIDC', () => {
  const apiClient: Client = new Client();
  const spy = vi.spyOn(apiClient, 'get');

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const render = (): RenderResult => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          refetchInterval: false,
          refetchIntervalInBackground: false,
          refetchOnWindowFocus: false,
          retry: false,
          staleTime: Infinity,
        },
      },
    });

    return _render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[`/auth/oidc?redirect=${encodeURIComponent('http://localhost:3000/applications')}`]}
        >
          <APIContext.Provider value={{ api: apiClient }}>
            <SigninOIDC />
          </APIContext.Provider>
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  it('can sign in with OIDC', async () => {
    spy.mockResolvedValueOnce({ url: 'http://localhost:3000' });
    render();

    const signInButton = await waitFor(() => {
      return screen.getByText(/Sign In/);
    });
    await userEvent.click(signInButton);
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(`/api/auth/oidc?redirect=${encodeURIComponent('/applications')}`);
  });
});
