import { render as _render, screen, RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

import SigninOIDCCallback from './SigninOIDCCallback';

import { APIClient, APIContext, APIError } from '../../../context/APIContext';
import { QueryClientProvider } from '../../../context/QueryClientProvider';

describe('SigninOIDCCallback', () => {
  const apiClient = new APIClient();
  const spy = vi.spyOn(apiClient, 'signinOIDC');

  const render = (): RenderResult => {
    return _render(
      <QueryClientProvider>
        <MemoryRouter initialEntries={['/?state=state&code=code']}>
          <APIContext.Provider value={{ client: apiClient, getUser: apiClient.getUser }}>
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

  it('should redirect user', async () => {
    spy.mockResolvedValueOnce({
      url: '/redirect/path',
      user: { dashboards: [], id: '', name: '', navigation: [], permissions: {}, teams: [] },
    });
    render();
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('state', 'code');
    expect(await waitFor(() => screen.getByText(/redirect target/))).toBeInTheDocument();
  });

  it('should show error', async () => {
    vi.spyOn(console, 'error').mockImplementationOnce(() => {
      // noop (to supress the error log in test output)
    });
    spy.mockRejectedValueOnce(new APIError(['unexpected error']));
    render();
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('state', 'code');
    expect(await waitFor(() => screen.getByText(/unexpected error/))).toBeInTheDocument();
  });
});
