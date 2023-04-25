import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { Login } from './Login';

describe('Login', () => {
  const client = new APIClient();
  const postSpy = vi.spyOn(client, 'post');
  const refetchAuth = vi.fn();

  const render = (): RenderResult => {
    return _render(
      <MemoryRouter initialEntries={['/']}>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <Login
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/jira/name/jira',
                name: 'jira',
                type: 'jira',
              }}
              refetchAuth={refetchAuth}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render login button and handle login', async () => {
    postSpy.mockResolvedValue(null);

    render();
    expect(await waitFor(() => screen.getByText('LOGIN'))).toBeInTheDocument();
    const loginButton = screen.getByText('LOGIN');
    await userEvent.click(loginButton);

    const emailInput = screen.getByLabelText('Email');
    await userEvent.type(emailInput, 'test@test.test');

    const passwordInput = screen.getByLabelText('Token');
    await userEvent.type(passwordInput, 'supersecret');

    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(postSpy).toHaveBeenCalled();
    expect(postSpy).toHaveBeenCalledWith('/api/plugins/jira/auth/login', {
      body: {
        email: 'test@test.test',
        token: 'supersecret',
      },
      headers: {
        'x-kobs-cluster': 'hub',
        'x-kobs-plugin': 'jira',
      },
    });
    expect(refetchAuth).toHaveBeenCalledTimes(1);
  });
});
