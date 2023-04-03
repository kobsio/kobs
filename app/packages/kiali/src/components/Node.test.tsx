import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { Box } from '@mui/material';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import fixtureNodeAppHTTPInboundMetrics from './__fixtures__/node-app-http-inbound-metrics.json';
import fixtureNodeAppHTTPOutboundMetrics from './__fixtures__/node-app-http-outbound-metrics.json';
import fixtureNodeAppTCPMetrics from './__fixtures__/node-app-tcp-metrics.json';
import fixtureNodeApp from './__fixtures__/node-app.json';
import fixtureNodeBoxInboundMetrics from './__fixtures__/node-box-inbound-metrics.json';
import fixtureNodeBoxOutboundMetrics from './__fixtures__/node-box-outbound-metrics.json';
import fixtureNodeBox from './__fixtures__/node-box.json';
import fixtureNodeServiceHTTPMetrics from './__fixtures__/node-service-http-metrics.json';
import fixtureNodeServiceTCPMetrics from './__fixtures__/node-service-tcp-metrics.json';
import fixtureNodeService from './__fixtures__/node-service.json';
import fixtureTopology from './__fixtures__/topology.json';
import { Node } from './Node';

import { IEdgeWrapper, INodeData, INodeWrapper } from '../utils/utils';

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
  const render = (node: INodeData, resolve: (path: string) => any): RenderResult => {
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
              <Node
                instance={{
                  cluster: 'hub',
                  id: '/cluster/hub/type/kiali/name/kiali',
                  name: 'kiali',
                  type: 'kiali',
                }}
                node={node}
                nodes={fixtureTopology.elements.nodes as INodeWrapper[]}
                edges={fixtureTopology.elements.edges as IEdgeWrapper[]}
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

  it('should render node of type service', async () => {
    render(fixtureNodeService as INodeData, (path: string) => {
      if (path.includes('request_count')) {
        return fixtureNodeServiceHTTPMetrics;
      }

      if (path.includes('tcp_sent')) {
        return fixtureNodeServiceTCPMetrics;
      }
    });

    expect(await waitFor(() => screen.getByText(/mycacheservice/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByTestId('kiali-chart'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getAllByText(/HTTP Requests per Second/).length)).toBe(2);
  });

  it('should render node of type app', async () => {
    render(fixtureNodeApp as INodeData, (path: string) => {
      if (path.includes('request_count') && path.includes('outbound')) {
        return fixtureNodeAppHTTPOutboundMetrics;
      }

      if (path.includes('request_count') && path.includes('inbound')) {
        return fixtureNodeAppHTTPInboundMetrics;
      }

      if (path.includes('tcp_sent')) {
        return fixtureNodeAppTCPMetrics;
      }
    });

    expect(await waitFor(() => screen.getByText(/mycacheservice/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getAllByTestId('kiali-chart').length)).toBe(2);
    expect(await waitFor(() => screen.getByText(/HTTP Requests per Second/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/TCP Outbound Traffic/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/HTTP Outbound Requests per Second/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/HTTP Inbound Requests per Second/))).toBeInTheDocument();
  });

  it('should render node of type box', async () => {
    render(fixtureNodeBox as INodeData, (path: string) => {
      if (path.includes('outbound')) {
        return fixtureNodeBoxOutboundMetrics;
      }

      if (path.includes('inbound')) {
        return fixtureNodeBoxInboundMetrics;
      }
    });

    expect(await waitFor(() => screen.getByText(/myservice/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getAllByTestId('kiali-chart').length)).toBe(2);
    expect(await waitFor(() => screen.getByText(/HTTP Requests per Second/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/gRPC Requests per Second/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/TCP Outbound Traffic/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/HTTP Outbound Requests per Second/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/HTTP Inbound Requests per Second/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/gRPC Inbound Requests per Second/))).toBeInTheDocument();
  });
});
