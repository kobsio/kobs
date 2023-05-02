import { QueryClientProvider } from '@kobsio/core';
import { Octokit } from '@octokit/rest';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import fixtureRepoIssues from './__fixtures__/repoissues.json';
import { RepositoryIssues } from './RepositoryIssues';

import { AuthContext } from '../../context/AuthContext';

describe('RepositoryIssues', () => {
  const client = new Octokit();
  const issuesAndPullRequestsSpy = vi.spyOn(client.search, 'issuesAndPullRequests');
  issuesAndPullRequestsSpy.mockResolvedValue(JSON.parse(JSON.stringify({ data: fixtureRepoIssues })));

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
            <RepositoryIssues
              title={title}
              repo="kobs"
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

  it('should render issues', async () => {
    render('Repository Issues');

    expect(await waitFor(() => screen.getByText('Repository Issues'))).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText(/Run Aggregations/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Query Syntax Validation/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Query History/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Query Attributes Autocomplete/))).toBeInTheDocument();
    expect(
      await waitFor(() => screen.getByText(/Local Docker build not working \(make generate-assets\)/)),
    ).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Add Integrations/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Add Notifications/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Customize Navigation Bar/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/applications with user\/team authorization/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Extend plugin functionality/))).toBeInTheDocument();

    expect(await waitFor(() => screen.getAllByText(/enhancement/).length)).toBe(9);
    expect(await waitFor(() => screen.getAllByText(/bug/).length)).toBe(1);
  });
});
