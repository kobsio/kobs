import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import GithubPage from './GithubPage';

import { description } from '../utils/utils';

vi.mock('./org/OrgPullRequests', () => {
  return {
    OrgPullRequests: () => {
      return <>OrgPullRequests</>;
    },
  };
});

vi.mock('./org/OrgRepos', () => {
  return {
    OrgRepos: () => {
      return <>OrgRepos</>;
    },
  };
});

describe('GithubPage', () => {
  const render = (): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
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

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <GithubPage
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/github/name/github',
                name: 'github',
                type: 'github',
              }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render', async () => {
    render();

    expect(screen.getByText('github')).toBeInTheDocument();
    expect(screen.getByText('(hub / github)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('OrgPullRequests'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('OrgRepos'))).toBeInTheDocument();
  });
});
