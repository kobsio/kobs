import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import fixtureLogs from './__fixtures__/logs.json';
import ElasticsearchPage from './ElasticsearchPage';

import { description } from '../utils/utils';

describe('ElasticsearchPage', () => {
  const render = (path: string): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      if (path.startsWith('/api/plugins/elasticsearch/logs')) {
        return fixtureLogs;
      }

      return [];
    });

    return _render(
      <MemoryRouter initialEntries={[path]}>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <ElasticsearchPage
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/elasticsearch/name/elasticsearch',
                name: 'elasticsearch',
                options: {
                  dataViews: [
                    {
                      indexPattern: 'filebeat-*',
                      name: 'filebeat-*',
                      timestampField: '@timestamp',
                    },
                  ],
                },
                type: 'elasticsearch',
              }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render logs', async () => {
    render('/');

    expect(screen.getByText('elasticsearch')).toBeInTheDocument();
    expect(screen.getByText('(hub / elasticsearch)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('f4fb04b9-dbb3-4d7b-87ba-98f327ca6c93'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/\d+ Documents in \d+ Milliseconds/))).toBeInTheDocument();

    const expandButton = screen.getByRole('button', { name: 'expand document' });
    userEvent.click(expandButton);

    expect(await waitFor(() => screen.getByText('Table'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('JSON'))).toBeInTheDocument();

    const jsonTab = screen.getByText('JSON');
    userEvent.click(jsonTab);
  });
});
