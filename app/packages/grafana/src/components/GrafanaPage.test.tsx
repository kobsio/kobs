import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import GrafanaPage from './GrafanaPage';

import { description } from '../utils/utils';

describe('GrafanaPage', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (path: string): RenderResult => {
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
      <MemoryRouter initialEntries={[path]}>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <GrafanaPage
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/grafana/name/grafana',
                name: 'grafana',
                type: 'grafana',
              }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render feed', async () => {
    render('/');
    expect(screen.getByText('grafana')).toBeInTheDocument();
    expect(screen.getByText('(hub / grafana)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('MongoDB WiredTiger'))).toBeInTheDocument();
  });
});
