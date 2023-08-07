import { QueryClientProvider } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import fixtureOrgRepos from './__fixtures__/orgrepos.json';
import { OrgRepos } from './OrgRepos';

import { AuthContext } from '../../context/AuthContext';

const Octokit = vi.fn().mockImplementation(() => ({
  search: {
    repos: () => JSON.parse(JSON.stringify({ data: fixtureOrgRepos })),
  },
}));

describe('OrgRepos', () => {
  const client = new Octokit();

  const render = (title: string): RenderResult => {
    return _render(
      <MemoryRouter initialEntries={['/']}>
        <QueryClientProvider>
          <AuthContext.Provider
            value={{
              getOctokitClient: () => client,
              organization: 'kobsio',
              token: 'mytoken',
              username: 'ricoberger',
            }}
          >
            <OrgRepos
              title={title}
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/github/name/github',
                name: 'github',
                type: 'github',
              }}
              times={{ time: 'last15Minutes', timeEnd: 0, timeStart: 0 }}
            />
          </AuthContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render repositories', async () => {
    render('Organization Repositories');
    expect(await waitFor(() => screen.getByText('Organization Repositories'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('kobs'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Kubernetes Observability Platform'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('klogs'))).toBeInTheDocument();
    expect(
      await waitFor(() => screen.getByText('Fast, scalable and reliable logging using Fluent Bit and ClickHouse')),
    ).toBeInTheDocument();
  });
});
