import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import JiraPanel from './JiraPanel';

vi.mock('./Issues', () => {
  return {
    IssuesWrapper: () => {
      return <>IssuesWrapper</>;
    },
  };
});

describe('JiraPanel', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (options: any): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    getSpy.mockResolvedValue({ url: 'jira.com' });

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <JiraPanel
              title="Test"
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/jira/name/jira',
                name: 'jira',
                type: 'jira',
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
    expect(await waitFor(() => screen.getByText('Invalid options for Jira plugin'))).toBeInTheDocument();
  });

  it('should render IssuesWrapper', async () => {
    render({ jql: 'project = KOBS' });
    expect(await waitFor(() => screen.getByText('IssuesWrapper'))).toBeInTheDocument();
  });
});
