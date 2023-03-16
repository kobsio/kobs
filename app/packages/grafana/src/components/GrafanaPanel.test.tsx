import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import GrafanaPanel from './GrafanaPanel';

describe('GrafanaPanel', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (options: any): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    getSpy.mockResolvedValue([
      {
        folderId: 25,
        folderTitle: 'Databases',
        folderUid: 'yf2TsPxVk',
        folderUrl: '/dashboards/f/yf2TsPxVk/databases',
        id: 32,
        tags: [],
        title: 'MongoDB WiredTiger',
        type: 'dash-db',
        uid: 'tBkrQGNmz',
        url: '/d/tBkrQGNmz/mongodb-wiredtiger',
      },
    ]);

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <GrafanaPanel
              title="Test"
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/grafana/name/grafana',
                name: 'grafana',
                type: 'grafana',
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
    expect(await waitFor(() => screen.getByText('Invalid options for Grafana plugin'))).toBeInTheDocument();
  });

  it('should render dashboards', async () => {
    render({ dashboards: ['tBkrQGNmz'], type: 'dashboards' });
    expect(await waitFor(() => screen.getByText('MongoDB WiredTiger'))).toBeInTheDocument();
  });
});
