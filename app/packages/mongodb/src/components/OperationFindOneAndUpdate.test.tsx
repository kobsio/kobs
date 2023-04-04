import { APIClient, APIContext, QueryClientProvider } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { OperationFindOneAndUpdate } from './OperationFindOneAndUpdate';

describe('OperationFindOneAndUpdate', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (): RenderResult => {
    const client = new APIClient();
    const postSpy = vi.spyOn(client, 'post');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    postSpy.mockImplementation(async (path: string, _): Promise<any> => {
      return {
        _id: '/tag/tracing',
        tag: 'tracingnew',
        updatedAt: 1680439130,
      };
    });

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <OperationFindOneAndUpdate
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
              filter={`{_id: '/tag/tracing'}`}
              update={`{$set: {tag: 'tracingnew'}}`}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render result', async () => {
    render();
    expect(await waitFor(() => screen.getByText('Result'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('/tag/tracing'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('tracingnew'))).toBeInTheDocument();
  });
});
