import { render as _render, screen, RenderResult, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

import Signin from './Signin';

import { APIClient, APIContext } from '../../../context/APIContext';
import QueryClientProvider from '../../../context/QueryClientProvider';

describe('Signin', () => {
  const apiClient: APIClient = new APIClient();
  const getSpy = vi.spyOn(apiClient, 'get');
  const signinSpy = vi.spyOn(apiClient, 'signin');

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const render = async (oidcURL = '/oidc/redirect'): Promise<RenderResult> => {
    getSpy.mockResolvedValueOnce({ url: oidcURL });

    const renderResult = _render(
      <QueryClientProvider>
        <APIContext.Provider value={{ client: apiClient, getUser: apiClient.getUser }}>
          <MemoryRouter initialEntries={[`/auth?redirect=${encodeURIComponent('/redirect/path')}`]}>
            <Routes>
              <Route path="/auth" element={<Signin />} />
              <Route path="/oidc/redirect" element={<>sign in page of the oidc provider</>} />
              <Route path="/redirect/path" element={<>login successful</>} />
            </Routes>
          </MemoryRouter>
        </APIContext.Provider>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByText(/Welcome to kobs/)).toBeInTheDocument());
    return renderResult;
  };

  it('should be possible to sign in with credentials', async () => {
    signinSpy.mockResolvedValueOnce({ dashboards: [], id: '', name: '', navigation: [], permissions: {}, teams: [] });
    await render();

    const emailInput = screen.getByLabelText(/Username/);
    await userEvent.type(emailInput, 'test@test.test');

    const passwordInput = screen.getByLabelText(/Password/);
    await userEvent.type(passwordInput, 'supersecret');

    await userEvent.click(screen.getByText(/Sign In/));

    expect(signinSpy).toHaveBeenCalled();
    expect(signinSpy).toHaveBeenCalledWith('test@test.test', 'supersecret');

    expect(await waitFor(() => screen.getByText(/login successful/))).toBeInTheDocument();
  });

  it('should show an error message when username is empty', async () => {
    await render();

    await userEvent.click(screen.getByText(/Sign In/));

    expect(screen.getByText(/Username is required/)).toBeInTheDocument();
  });

  it('should show an error message when password is empty', async () => {
    await render();

    const emailInput = screen.getByLabelText(/Username/);
    await userEvent.type(emailInput, 'test@test.test');
    await userEvent.click(screen.getByText(/Sign In/));

    expect(screen.getByText(/Password is required/)).toBeInTheDocument();
  });

  it('should show an error when credentials are invalid', async () => {
    await render();

    const emailInput = screen.getByLabelText(/Username/);
    await userEvent.type(emailInput, 'test@test.test');

    const passwordInput = screen.getByLabelText(/Password/);
    await userEvent.type(passwordInput, 'supersecret');

    signinSpy.mockRejectedValue({ error: 'Invalid username or password' });
    await userEvent.click(screen.getByText(/Sign In/));

    expect(screen.getByText(/Invalid username or password/)).toBeInTheDocument();
  });

  it('should be possible to sign in with OIDC', async () => {
    await render();

    const signInButton = await waitFor(() => {
      return screen.getByText(/Sign in via OIDC/);
    });
    await userEvent.click(signInButton);

    expect(getSpy).toHaveBeenCalled();
    expect(getSpy).toHaveBeenCalledWith(`/api/auth/oidc?redirect=${encodeURIComponent('/redirect/path')}`);

    expect(screen.getByText(/sign in page of the oidc provider/)).toBeInTheDocument();
  });

  it('should disable sign in via OIDC button when not configured', async () => {
    await render('');

    expect(screen.getByText(/Sign in via OIDC/)).toHaveAttribute('aria-disabled', 'true');
  });
});
