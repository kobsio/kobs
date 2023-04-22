import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { Projects } from './Projects';

describe('Projects', () => {
  const render = (): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    getSpy.mockResolvedValue([
      {
        avatarUrls: {
          '16x16': 'https://jira.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/12598?size=xsmall',
          '24x24': 'https://jira.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/12598?size=small',
          '32x32': 'https://jira.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/12598?size=medium',
          '48x48': 'https://jira.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/12598',
        },
        expand: 'description,lead,issueTypes,url,projectKeys,permissions,insight',
        id: '10497',
        key: 'KOBS',
        name: 'Kubernetes Observability Platform',
        projectCategory: {
          description: '',
          id: '',
          name: '',
          self: '',
        },
        projectTypeKey: 'business',
        self: 'https://jira.atlassian.net/rest/api/2/project/10497',
      },
    ]);

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <Projects
              title="Projects"
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/jira/name/jira',
                name: 'jira',
                type: 'jira',
              }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render issues', async () => {
    render();
    expect(await waitFor(() => screen.getByText(/KOBS/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Kubernetes Observability Platform/))).toBeInTheDocument();
  });
});
