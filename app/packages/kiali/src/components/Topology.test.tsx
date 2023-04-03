import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { Box } from '@mui/material';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import fixtureTopology from './__fixtures__/topology.json';
import { Topology } from './Topology';

vi.mock('@kobsio/core', async () => {
  const originalModule = await vi.importActual('@kobsio/core');
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(originalModule as any),
    useDimensions: vi.fn(() => ({ height: 500, width: 500 })),
  };
});

describe('Topology', () => {
  const render = (): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      return fixtureTopology;
    });

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <Box height="500px">
              <Topology
                instance={{
                  cluster: 'hub',
                  id: '/cluster/hub/type/kiali/name/kiali',
                  name: 'kiali',
                  type: 'kiali',
                }}
                namespaces={['myservice']}
                times={{
                  time: 'last15Minutes',
                  timeEnd: 0,
                  timeStart: 0,
                }}
              />
            </Box>
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render topology chart', async () => {
    render();
    expect(await waitFor(() => screen.getByTestId('kiali-topology-graph'))).toBeInTheDocument();
  });
});
