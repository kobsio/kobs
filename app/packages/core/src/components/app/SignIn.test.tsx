import { render as _render, screen, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  const setup = (): RenderResult => {
    return _render(
      <APIContext.Provider value={{ api: apiClient }}>
        <Signin />
      </APIContext.Provider>,
    );
  };

  it('can sign in with credentials', async () => {
    setup();

    const emailInput = screen.getByLabelText(/E-Mail/);
    await userEvent.type(emailInput, 'test@test.test');

    const passwordInput = screen.getByLabelText(/Password/);
    await userEvent.type(passwordInput, 'supersecret');

    await userEvent.click(screen.getByText(/Sign In/));

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('/api/auth/signin', {
      body: { email: 'test@test.test', password: 'supersecret' },
    });
  });

  it('shows error message when email is empty', async () => {
    setup();
    await userEvent.click(screen.getByText(/Sign In/));

    expect(screen.getByText(/please fill in your e-mail/)).toBeInTheDocument();
  });

  it('shows error message when password is empty', async () => {
    setup();
    const emailInput = screen.getByLabelText(/E-Mail/);
    await userEvent.type(emailInput, 'test@test.test');
    await userEvent.click(screen.getByText(/Sign In/));

    expect(screen.getByText(/please fill in your password/)).toBeInTheDocument();
  });

  it('shows warning when credentials are invalid', async () => {
    setup();

    spy.mockRejectedValue({ error: 'invalid credentials' });

    const emailInput = screen.getByLabelText(/E-Mail/);
    await userEvent.type(emailInput, 'test@test.test');

    const passwordInput = screen.getByLabelText(/Password/);
    await userEvent.type(passwordInput, 'supersecret');

    await userEvent.click(screen.getByText(/Sign In/));

    expect(screen.getByText(/The credentials are not correct./)).toBeInTheDocument();
  });
});
