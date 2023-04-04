import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import MongoDBPage from './MongoDBPage';

import { description } from '../utils/utils';

vi.mock('./OperationCount', () => {
  return {
    OperationCount: () => {
      return <>Mocked OperationCount</>;
    },
  };
});

vi.mock('./OperationFind', () => {
  return {
    OperationFind: () => {
      return <>Mocked OperationFind</>;
    },
  };
});

vi.mock('./OperationFindOne', () => {
  return {
    OperationFindOne: () => {
      return <>Mocked OperationFindOne</>;
    },
  };
});

describe('MongoDBPage', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (path: string): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      if (path.startsWith('/api/plugins/mongodb/stats')) {
        return {
          avgObjSize: 2355.4152473641525,
          collections: 10,
          dataSize: 2904227,
          db: 'kobs',
          freeStorageSize: 0,
          fsTotalSize: 62725623808,
          fsUsedSize: 35710619648,
          indexFreeStorageSize: 0,
          indexSize: 421888,
          indexes: 10,
          objects: 1233,
          scaleFactor: 1,
          storageSize: 1613824,
          totalFreeStorageSize: 0,
          totalSize: 2035712,
          views: 0,
        };
      }

      if (path.startsWith('/api/plugins/mongodb/collections/stats?collectionName=tags')) {
        return {
          avgObjSize: 68,
          count: 40,
          freeStorageSize: 16384,
          nindexes: 1,
          ns: 'kobs.tags',
          numOrphanDocs: 0,
          size: 2734,
          storageSize: 36864,
          totalIndexSize: 36864,
          totalSize: 73728,
        };
      }

      if (path.startsWith('/api/plugins/mongodb/collections')) {
        return [
          'tags',
          'topology',
          'namespaces',
          'applications',
          'sessions',
          'dashboards',
          'plugins',
          'users',
          'crds',
          'teams',
        ];
      }

      return [];
    });

    return _render(
      <MemoryRouter initialEntries={[path]}>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <MongoDBPage
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/mongodb/name/mongodb',
                name: 'mongodb',
                type: 'mongodb',
              }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render overview', async () => {
    render('/');

    expect(screen.getByText('mongodb')).toBeInTheDocument();
    expect(screen.getByText('(hub / mongodb)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('Database Statistics'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Database name'))).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('Collections'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('tags'))).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'tags details' }));
    expect(await waitFor(() => screen.getByText('Collection Statistics'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('kobs.tags'))).toBeInTheDocument();
  });

  it('should render document', async () => {
    render('/tags/document?_id=sth');

    expect(screen.getByText('mongodb: tags')).toBeInTheDocument();
    expect(screen.getByText('(hub / mongodb)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('Mocked OperationFindOne'))).toBeInTheDocument();
  });

  it('should render query', async () => {
    render('/tags/query');

    expect(screen.getByText('mongodb: tags')).toBeInTheDocument();
    expect(screen.getByText('(hub / mongodb)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('Operation'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Filter'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Sort'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Limit'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Mocked OperationFind'))).toBeInTheDocument();
  });
});
