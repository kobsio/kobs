import { QueryClientProvider } from '@kobsio/core';
import { Octokit } from '@octokit/rest';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { TeamMembers } from './TeamMembers';

import { AuthContext } from '../../context/AuthContext';

describe('TeamMembers', () => {
  const client = new Octokit();
  const paginateSpy = vi.spyOn(client, 'paginate');
  paginateSpy.mockResolvedValue([
    {
      avatar_url: 'https://avatars.githubusercontent.com/u/18552168?v=4',
      html_url: 'https://github.com/ricoberger',
      login: 'ricoberger',
    },
  ]);

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
            <TeamMembers
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

  it('should render members', async () => {
    render('Team Members');
    expect(await waitFor(() => screen.getByText('Team Members'))).toBeInTheDocument();
    const logo = await waitFor(() => screen.getByRole('img'));
    expect(logo).toHaveAttribute('src', 'https://avatars.githubusercontent.com/u/18552168?v=4');
    expect(logo).toHaveAttribute('alt', 'ricoberger');
  });
});
