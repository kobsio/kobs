import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { Box } from '@mui/material';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import fixtureEdgeGRPCMetrics from './__fixtures__/edge-grpc-metrics.json';
import fixtureEdgeGRPC from './__fixtures__/edge-grpc.json';
import fixtureEdgeHTTPMetrics from './__fixtures__/edge-http-metrics.json';
import fixtureEdgeHTTP from './__fixtures__/edge-http.json';
import fixtureEdgeTCP from './__fixtures__/edge-tcp.json';
import fixtureTopology from './__fixtures__/topology.json';
import { Edge } from './Edge';

import { IEdgeData, INodeWrapper } from '../utils/utils';

vi.mock('@kobsio/core', async () => {
  const originalModule = await vi.importActual('@kobsio/core');
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(originalModule as any),
    useDimensions: vi.fn(() => ({ height: 500, width: 500 })),
  };
});

describe('Node', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (edge: IEdgeData, resolve: (path: string) => any): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      return resolve(path);
    });

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <Box height="500px">
              <Edge
                instance={{
                  cluster: 'hub',
                  id: '/cluster/hub/type/kiali/name/kiali',
                  name: 'kiali',
                  type: 'kiali',
                }}
                edge={edge}
                nodes={fixtureTopology.elements.nodes as INodeWrapper[]}
                times={{
                  time: 'last15Minutes',
                  timeEnd: 0,
                  timeStart: 0,
                }}
                open={true}
                onClose={vi.fn()}
              />
            </Box>
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render edge with grpc protocol', async () => {
    render(fixtureEdgeGRPC as IEdgeData, (path: string) => {
      return fixtureEdgeGRPCMetrics;
    });

    expect(await waitFor(() => screen.getByText(/myotherservice/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/myservice/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Traffic/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Flags/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Hosts/))).toBeInTheDocument();

    await userEvent.click(screen.getByText(/Flags/));
    await userEvent.click(screen.getByText(/Hosts/));
  });

  it('should render edge with http protocol', async () => {
    render(fixtureEdgeHTTP as IEdgeData, (path: string) => {
      return fixtureEdgeHTTPMetrics;
    });

    expect(await waitFor(() => screen.getByText(/myservice/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Traffic/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Flags/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Hosts/))).toBeInTheDocument();

    await userEvent.click(screen.getByText(/Flags/));
    await userEvent.click(screen.getByText(/Hosts/));
  });

  it('should render edge with tcp protocol', async () => {
    render(fixtureEdgeTCP as IEdgeData, (path: string) => {
      return null;
    });

    expect(await waitFor(() => screen.getByText(/myservice/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/kubernetes/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Flags by HTTP Code/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Hosts/))).toBeInTheDocument();
  });
});
