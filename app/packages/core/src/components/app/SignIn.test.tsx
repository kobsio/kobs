import { render as _render, screen, RenderResult, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

import Signin from './SignIn';

import Client from '../api/api';
import { APIContext } from '../api/context';

describe('SignIn', () => {
  const apiClient: Client = new Client();
  const spy = vi.spyOn(apiClient, 'post');

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const render = (): RenderResult => {
    return _render(
      <MemoryRouter initialEntries={[`/?redirect=${encodeURIComponent('/redirect/path')}`]}>
        <APIContext.Provider value={{ api: apiClient }}>
          <Routes>
            <Route path="/" element={<Signin />} />
            <Route path="/redirect/path" element={<>login successful</>} />
          </Routes>
        </APIContext.Provider>
      </MemoryRouter>,
    );
  };

  it('can sign in with credentials', async () => {
    render();
    spy.mockResolvedValueOnce(undefined);

    const emailInput = screen.getByLabelText(/E-Mail/);
    await userEvent.type(emailInput, 'test@test.test');

    const passwordInput = screen.getByLabelText(/Password/);
    await userEvent.type(passwordInput, 'supersecret');

    await userEvent.click(screen.getByText(/Sign In/));

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('/api/auth/signin', {
      body: { email: 'test@test.test', password: 'supersecret' },
    });

    expect(await waitFor(() => screen.getByText(/login successful/))).toBeInTheDocument();
  });

  it('shows error message when email is empty', async () => {
    render();
    await userEvent.click(screen.getByText(/Sign In/));

    expect(screen.getByText(/please fill in your e-mail/)).toBeInTheDocument();
  });

  it('shows error message when password is empty', async () => {
    render();
    const emailInput = screen.getByLabelText(/E-Mail/);
    await userEvent.type(emailInput, 'test@test.test');
    await userEvent.click(screen.getByText(/Sign In/));

    expect(screen.getByText(/please fill in your password/)).toBeInTheDocument();
  });

  it('shows warning when credentials are invalid', async () => {
    render();

    spy.mockRejectedValue({ error: 'invalid credentials' });

    const emailInput = screen.getByLabelText(/E-Mail/);
    await userEvent.type(emailInput, 'test@test.test');

    const passwordInput = screen.getByLabelText(/Password/);
    await userEvent.type(passwordInput, 'supersecret');

    await userEvent.click(screen.getByText(/Sign In/));

    expect(screen.getByText(/The credentials are not correct./)).toBeInTheDocument();
  });
});
