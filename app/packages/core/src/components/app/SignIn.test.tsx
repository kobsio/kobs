import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as _render, screen, RenderResult, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

import Signin from './SignIn';

import Client from '../api/api';
import { APIContext } from '../api/context';

describe('SignIn', () => {
  const apiClient: Client = new Client();
  const getSpy = vi.spyOn(apiClient, 'get');
  const postSpy = vi.spyOn(apiClient, 'post');

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const render = async (): Promise<RenderResult> => {
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
    const renderResult = _render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/auth?redirect=${encodeURIComponent('/redirect/path')}`]}>
          <APIContext.Provider value={{ api: apiClient }}>
            <Routes>
              <Route path="/auth" element={<Signin />} />
              <Route path="/redirect/path" element={<>login successful</>} />
            </Routes>
          </APIContext.Provider>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByText(/Sign into your account/)).toBeInTheDocument());
    return renderResult;
  };

  it('can sign in with credentials', async () => {
    getSpy.mockResolvedValueOnce({ url: '1234' });
    postSpy.mockResolvedValueOnce(undefined);
    await render();

    const emailInput = screen.getByLabelText(/E-Mail/);
    await userEvent.type(emailInput, 'test@test.test');

    const passwordInput = screen.getByLabelText(/Password/);
    await userEvent.type(passwordInput, 'supersecret');

    await userEvent.click(screen.getByText(/Sign In/));

    expect(postSpy).toHaveBeenCalled();
    expect(postSpy).toHaveBeenCalledWith('/api/auth/signin', {
      body: { email: 'test@test.test', password: 'supersecret' },
      disableAutorefresh: true,
    });

    expect(await waitFor(() => screen.getByText(/login successful/))).toBeInTheDocument();
  });

  it('shows error message when email is empty', async () => {
    getSpy.mockResolvedValueOnce({ url: '1234' });
    await render();
    await userEvent.click(screen.getByText(/Sign In/));

    expect(screen.getByText(/please fill in your e-mail/)).toBeInTheDocument();
  });

  it('shows error message when password is empty', async () => {
    getSpy.mockResolvedValueOnce({ url: '1234' });
    await render();
    const emailInput = screen.getByLabelText(/E-Mail/);
    await userEvent.type(emailInput, 'test@test.test');
    await userEvent.click(screen.getByText(/Sign In/));

    expect(screen.getByText(/please fill in your password/)).toBeInTheDocument();
  });

  it('shows warning when credentials are invalid', async () => {
    getSpy.mockResolvedValueOnce({ url: '1234' });
    await render();

    postSpy.mockRejectedValue({ error: 'invalid credentials' });

    const emailInput = screen.getByLabelText(/E-Mail/);
    await userEvent.type(emailInput, 'test@test.test');

    const passwordInput = screen.getByLabelText(/Password/);
    await userEvent.type(passwordInput, 'supersecret');

    await userEvent.click(screen.getByText(/Sign In/));

    expect(screen.getByText(/The credentials are not correct./)).toBeInTheDocument();
  });

  it('can sign in with OIDC', async () => {
    getSpy.mockResolvedValueOnce({ url: '1234' });
    await render();

    const signInButton = await waitFor(() => {
      return screen.getByText(/Sign In/);
    });
    await userEvent.click(signInButton);
    expect(getSpy).toHaveBeenCalled();
    expect(getSpy).toHaveBeenCalledWith(`/api/auth/oidc?redirect=${encodeURIComponent('/redirect/path')}`, {
      disableAutorefresh: true,
    });
  });
});
