import { APIClient, APIContext, QueryClientProvider } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { OperationAggregate } from './OperationAggregate';

describe('OperationAggregate', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (): RenderResult => {
    const client = new APIClient();
    const postSpy = vi.spyOn(client, 'post');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    postSpy.mockImplementation(async (path: string, _): Promise<any> => {
      return [
        {
          _id: [
            {
              name: 'mongodb',
            },
            {
              namespace: 'yopass',
            },
          ],
          clusters: ['test1', 'test2'],
          names: ['mongodb', 'mongodb'],
          namespaces: ['yopass', 'yopass'],
        },
      ];
    });

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <OperationAggregate
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
              pipeline={`[
                {
                  $group: {
                    "_id": [
                      {"name": "$name"},
                      {"namespace": "$namespace"}
                    ],
                    "clusters": {$push: "$cluster"},
                    "namespaces": {$push: "$namespace"},
                    "names": {$push: "$name"},
                  }
                }
              ]`}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render result', async () => {
    render();
    expect(await waitFor(() => screen.getByText('Result'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('[{"name":"mongodb"},{"namespace":"yopass"}]'))).toBeInTheDocument();
  });
});
