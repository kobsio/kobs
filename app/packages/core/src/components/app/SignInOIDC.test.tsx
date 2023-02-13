import { render as _render, screen, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import SigninOIDC from './SignInOIDC';

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
      <MemoryRouter>
        <APIContext.Provider value={{ api: apiClient }}>
          <SigninOIDC />
        </APIContext.Provider>
      </MemoryRouter>,
    );
  };

  it('can sign in with OIDC', async () => {
    render();
    await userEvent.click(screen.getByText(/Sign In/));
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('/app/signin/oidc');
  });
});
