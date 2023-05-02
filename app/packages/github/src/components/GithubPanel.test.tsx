import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import GithubPanel from './GithubPanel';

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

vi.mock('./repos/RepositoryIssues', () => {
  return {
    RepositoryIssues: () => {
      return <>RepositoryIssues</>;
    },
  };
});

vi.mock('./repos/RepositoryPullRequests', () => {
  return {
    RepositoryPullRequests: () => {
      return <>RepositoryPullRequests</>;
    },
  };
});

vi.mock('./repos/RepositoryWorkflowRuns', () => {
  return {
    RepositoryWorkflowRuns: () => {
      return <>RepositoryWorkflowRuns</>;
    },
  };
});

vi.mock('./teams/TeamMembers', () => {
  return {
    TeamMembers: () => {
      return <>TeamMembers</>;
    },
  };
});

vi.mock('./teams/TeamRepos', () => {
  return {
    TeamRepos: () => {
      return <>TeamRepos</>;
    },
  };
});

vi.mock('./users/UserPullRequests', () => {
  return {
    UserPullRequests: () => {
      return <>UserPullRequests</>;
    },
  };
});

describe('GithubPanel', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (options: any): RenderResult => {
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
            <GithubPanel
              title="Test"
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/github/name/github',
                name: 'github',
                type: 'github',
              }}
              options={options}
              times={{
                time: 'last15Minutes',
                timeEnd: 0,
                timeStart: 0,
              }}
              setTimes={() => {
                // nothing
              }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render error on missing options', async () => {
    render(undefined);
    expect(await waitFor(() => screen.getByText('Invalid options for GitHub plugin'))).toBeInTheDocument();
  });

  it('should render OrgPullRequests', async () => {
    render({ type: 'orgpullrequests' });
    expect(await waitFor(() => screen.getByText('OrgPullRequests'))).toBeInTheDocument();
  });

  it('should render OrgRepos', async () => {
    render({ type: 'orgrepositories' });
    expect(await waitFor(() => screen.getByText('OrgRepos'))).toBeInTheDocument();
  });

  it('should render TeamMembers', async () => {
    render({ team: 'maintainers', type: 'teammembers' });
    expect(await waitFor(() => screen.getByText('TeamMembers'))).toBeInTheDocument();
  });

  it('should render TeamRepos', async () => {
    render({ team: 'maintainers', type: 'teamrepositories' });
    expect(await waitFor(() => screen.getByText('TeamRepos'))).toBeInTheDocument();
  });

  it('should render RepositoryIssues', async () => {
    render({ repository: 'kobs', type: 'repositoryissues' });
    expect(await waitFor(() => screen.getByText('RepositoryIssues'))).toBeInTheDocument();
  });

  it('should render RepositoryPullRequests', async () => {
    render({ repository: 'kobs', type: 'repositorypullrequests' });
    expect(await waitFor(() => screen.getByText('RepositoryPullRequests'))).toBeInTheDocument();
  });

  it('should render RepositoryWorkflowRuns', async () => {
    render({ repository: 'kobs', type: 'repositoryworkflowruns' });
    expect(await waitFor(() => screen.getByText('RepositoryWorkflowRuns'))).toBeInTheDocument();
  });

  it('should render UserPullRequests', async () => {
    render({ type: 'userpullrequests' });
    expect(await waitFor(() => screen.getByText('UserPullRequests'))).toBeInTheDocument();
  });
});
