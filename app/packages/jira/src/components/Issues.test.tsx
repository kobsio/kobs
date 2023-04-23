import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import fixtureIssues from './__fixtures__/issues.json';
import fixtureIssuesWrapper from './__fixtures__/issueswrapper.json';
import { Issues, IssuesWrapper } from './Issues';

describe('Issues', () => {
  const render = (): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    getSpy.mockResolvedValue(fixtureIssues);

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <Issues
              title="Issues"
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/jira/name/jira',
                name: 'jira',
                type: 'jira',
              }}
              jql=""
              page={{ page: 1, perPage: 10 }}
              setPage={vi.fn()}
              times={{
                time: 'last15Minutes',
                timeEnd: 0,
                timeStart: 0,
              }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render issues', async () => {
    render();
    expect(await waitFor(() => screen.getByText(/KOBS-3105/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Proxy support/))).toBeInTheDocument();
    await userEvent.click(screen.getByText(/KOBS-3105/));
    expect(await waitFor(() => screen.getByText(/Support Task/))).toBeInTheDocument();
  });
});

describe('IssuesWrapper', () => {
  const render = (): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    getSpy.mockResolvedValue(fixtureIssuesWrapper);

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <IssuesWrapper
              title="Issues"
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/jira/name/jira',
                name: 'jira',
                type: 'jira',
              }}
              jql=""
              times={{
                time: 'last15Minutes',
                timeEnd: 0,
                timeStart: 0,
              }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render issues', async () => {
    render();
    expect(await waitFor(() => screen.getByText(/KOBS-3101/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Update Kubernetes Clusters to 1.25.x/))).toBeInTheDocument();
    await userEvent.click(screen.getByText(/KOBS-3101/));
    expect(await waitFor(() => screen.getByText(/Story/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/KOBS-3080/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/KOBS-2781/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Update Kubernetes Clusters to 1.24.x/))).toBeInTheDocument();
  });
});
