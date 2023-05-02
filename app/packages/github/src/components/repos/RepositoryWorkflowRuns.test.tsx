import { QueryClientProvider } from '@kobsio/core';
import { Octokit } from '@octokit/rest';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import fixtureRepoWorkflowRuns from './__fixtures__/repoworkflowruns.json';
import fixtureRepoWorkflowRunsJobs from './__fixtures__/repoworkflowrunsjobs.json';
import { RepositoryWorkflowRuns } from './RepositoryWorkflowRuns';

import { AuthContext } from '../../context/AuthContext';

describe('RepositoryWorkflowRuns', () => {
  const client = new Octokit();
  const listWorkflowRunsForRepoSpy = vi.spyOn(client.actions, 'listWorkflowRunsForRepo');
  listWorkflowRunsForRepoSpy.mockResolvedValue(JSON.parse(JSON.stringify({ data: fixtureRepoWorkflowRuns })));
  const listJobsForWorkflowRunAttemptSpy = vi.spyOn(client.actions, 'listJobsForWorkflowRunAttempt');
  listJobsForWorkflowRunAttemptSpy.mockResolvedValue(JSON.parse(JSON.stringify({ data: fixtureRepoWorkflowRunsJobs })));
  const downloadJobLogsForWorkflowRunSpy = vi.spyOn(client.actions, 'downloadJobLogsForWorkflowRun');
  downloadJobLogsForWorkflowRunSpy.mockResolvedValue(JSON.parse(JSON.stringify({ data: 'GitHub Action Logs' })));

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
            <RepositoryWorkflowRuns
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

  it('should render workflow runs', async () => {
    render('Repository Workflow Runs');

    expect(await waitFor(() => screen.getByText('Repository Workflow Runs'))).toBeInTheDocument();

    expect(
      await waitFor(() => screen.getAllByText(/don't build the connection string with the database config/).length),
    ).toBe(2);
    expect(await waitFor(() => screen.getAllByText(/fix package-lock.json/).length)).toBe(4);
    expect(await waitFor(() => screen.getAllByText(/remove unused import/).length)).toBe(2);
    expect(await waitFor(() => screen.getAllByText(/grid around UseQueryWrapper/).length)).toBe(2);

    await userEvent.click(screen.getAllByText(/don't build the connection string with the database config/)[0]);
    expect(await waitFor(() => screen.getByText('Node.js (app)'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Node.js (core)'))).toBeInTheDocument();

    await userEvent.click(screen.getByText('Node.js (app)'));
    expect(await waitFor(() => screen.getByText('Setup Node.js'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('GitHub Action Logs'))).toBeInTheDocument();
  });
});
