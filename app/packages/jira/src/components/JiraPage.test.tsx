import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import JiraPage from './JiraPage';

import { description } from '../utils/utils';

vi.mock('./Issues', () => {
  return {
    Issues: () => {
      return <>Issues</>;
    },
    IssuesWrapper: () => {
      return <>IssuesWrapper</>;
    },
  };
});

vi.mock('./Projects', () => {
  return {
    Projects: () => {
      return <>Projects</>;
    },
  };
});

describe('JiraPage', () => {
  const render = (path: string): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    getSpy.mockResolvedValue({ url: 'jira.com' });

    return _render(
      <MemoryRouter initialEntries={[path]}>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <JiraPage
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

  it('should render overview', async () => {
    render('/');

    expect(screen.getByText('jira')).toBeInTheDocument();
    expect(screen.getByText('(hub / jira)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getAllByText('IssuesWrapper').length)).toBe(2);
    expect(await waitFor(() => screen.getByText('Projects'))).toBeInTheDocument();
  });

  it('should render search', async () => {
    render('/search');

    expect(screen.getByText('jira')).toBeInTheDocument();
    expect(screen.getByText('(hub / jira)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('Issues'))).toBeInTheDocument();
  });
});
