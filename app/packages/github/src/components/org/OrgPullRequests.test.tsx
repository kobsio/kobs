import { QueryClientProvider } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import fixtureOrgPRs from './__fixtures__/orgprs.json';
import { OrgPullRequests } from './OrgPullRequests';

import { AuthContext } from '../../context/AuthContext';

const Octokit = vi.fn().mockImplementation(() => ({
  search: {
    issuesAndPullRequests: () => JSON.parse(JSON.stringify({ data: fixtureOrgPRs })),
  },
}));

describe('OrgPullRequests', () => {
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
            <OrgPullRequests
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

  it('should render pull requests', async () => {
    render('Organization Pull Requests');

    expect(await waitFor(() => screen.getByText('Organization Pull Requests'))).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText(/add sql plugin/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Fix Add Filter for Number Fields/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Fix History for Pipeline and Update/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Add Query History/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Adjust Components Structure/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Ensure same Height for all Plugin Panels/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Fix Returned Error Type from useQuery Hook/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Fix Vertical Scrolling in Service Pages/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Fix Overflow in Documents View/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Fix Links in Application Groups Panel/))).toBeInTheDocument();

    expect(await waitFor(() => screen.getAllByText(/changelog: added/).length)).toBe(1);
    expect(await waitFor(() => screen.getAllByText(/changelog: fixed/).length)).toBe(7);
    expect(await waitFor(() => screen.getAllByText(/changelog: changed/).length)).toBe(1);
  });
});
