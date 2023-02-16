import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as _render, screen, RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

import SigninOIDCCallback from './SignInCallback';

import Client, { APIError } from '../api/api';
import { APIContext } from '../api/context';

describe('SignInCallback', () => {
  const apiClient = new Client();
  const spy = vi.spyOn(apiClient, 'get');

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
        <MemoryRouter>
          <APIContext.Provider value={{ api: apiClient }}>
            <Routes>
              <Route path="/" element={<SigninOIDCCallback />} />
              <Route path="/redirect/path" element={<>redirect target</>} />
            </Routes>
          </APIContext.Provider>
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('redirects the user', async () => {
    spy.mockResolvedValueOnce({ url: '/redirect/path' });
    render();
    expect(await waitFor(() => screen.getByText(/redirect target/))).toBeInTheDocument();
  });

  it('shows error', async () => {
    vi.spyOn(console, 'error').mockImplementationOnce(() => {
      // noop (to supress the error log in test output)
    });
    spy.mockRejectedValueOnce(new APIError('unexpected error'));
    render();
    expect(await waitFor(() => screen.getByText(/unexpected error/))).toBeInTheDocument();
  });
});
