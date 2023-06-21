import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import fixtureLogs from './__fixtures__/logs.json';
import ElasticsearchPanel from './ElasticsearchPanel';

describe('ElasticsearchPanel', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (options: any): RenderResult => {
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
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <ElasticsearchPanel
              title="Test"
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
              options={options}
              times={{
                time: 'last15Minutes',
                timeEnd: 0,
                timeStart: 0,
              }}
              setTimes={vi.fn()}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render error on missing options', async () => {
    render(undefined);
    expect(await waitFor(() => screen.getByText('Invalid options for Elasticsearch plugin'))).toBeInTheDocument();
  });

  it('should render single log query', async () => {
    render({ queries: [{ dataView: 'filebeat-*', name: 'test', query: '' }], type: 'logs' });
    expect(await waitFor(() => screen.getByText('f4fb04b9-dbb3-4d7b-87ba-98f327ca6c93'))).toBeInTheDocument();
  });

  it('should render multiple log queries', async () => {
    render({
      queries: [
        { dataView: 'filebeat-*', name: 'my test query 1', query: '' },
        { dataView: 'filebeat-*', name: 'my test query 2', query: '' },
      ],
      type: 'logs',
    });

    expect(await waitFor(() => screen.getByText('my test query 1'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('my test query 2'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('f4fb04b9-dbb3-4d7b-87ba-98f327ca6c93'))).toBeInTheDocument();

    const tab = screen.getByText('my test query 2');
    userEvent.click(tab);

    expect(await waitFor(() => screen.getByText('my test query 1'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('my test query 2'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('f4fb04b9-dbb3-4d7b-87ba-98f327ca6c93'))).toBeInTheDocument();
  });
});
