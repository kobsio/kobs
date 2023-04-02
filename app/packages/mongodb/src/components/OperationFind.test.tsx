import { APIClient, APIContext, QueryClientProvider } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { OperationFind } from './OperationFind';

describe('OperationFind', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (): RenderResult => {
    const client = new APIClient();
    const postSpy = vi.spyOn(client, 'post');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    postSpy.mockImplementation(async (path: string, _): Promise<any> => {
      return [
        {
          _id: '/tag/victoriametrics',
          tag: 'victoriametrics',
          updatedAt: 1680439130,
        },
        {
          _id: '/tag/tracing',
          tag: 'tracing',
          updatedAt: 1680439130,
        },
        {
          _id: '/tag/operator',
          tag: 'operator',
          updatedAt: 1680439130,
        },
        {
          _id: '/tag/observability',
          tag: 'observability',
          updatedAt: 1680439130,
        },
      ];
    });

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <OperationFind
              title="Result"
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/mongodb/name/mongodb',
                name: 'mongodb',
                type: 'mongodb',
              }}
              times={{
                time: 'last15Minutes',
                timeEnd: 0,
                timeStart: 0,
              }}
              showActions={true}
              collectionName="applications"
              filter="{}"
              limit={4}
              sort={`{"tag" : 1}`}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render result', async () => {
    render();
    expect(await waitFor(() => screen.getByText('Result'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('/tag/victoriametrics'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('/tag/tracing'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('/tag/operator'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('/tag/observability'))).toBeInTheDocument();
  });
});
