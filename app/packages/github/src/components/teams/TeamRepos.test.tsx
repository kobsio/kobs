import { QueryClientProvider } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import fixtureTeamRepos from './__fixtures__/teamrepos.json';
import { TeamRepos } from './TeamRepos';

import { AuthContext } from '../../context/AuthContext';

const Octokit = vi.fn().mockImplementation(() => ({
  teams: {
    listReposInOrg: () => JSON.parse(JSON.stringify({ data: fixtureTeamRepos })),
  },
}));

describe('TeamRepos', () => {
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
            <TeamRepos
              title={title}
              slug="maintainers"
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
    render('Team Repositories');

    expect(await waitFor(() => screen.getByText(/Team Repositories/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Kubernetes Observability Platform/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Helm repository for kobs/))).toBeInTheDocument();
    expect(
      await waitFor(() => screen.getByText(/Fast, scalable and reliable logging using Fluent Bit and ClickHouse/)),
    ).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Template for kobs plugins/))).toBeInTheDocument();
  });
});
