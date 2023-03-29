import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import fixtureMonitorOperationsCalls from './__fixtures__/monitor-operations-calls.json';
import fixtureMonitorOperationsErrors from './__fixtures__/monitor-operations-errors.json';
import fixtureMonitorOperationsQuantile50 from './__fixtures__/monitor-operations-quantil-50.json';
import fixtureMonitorOperationsQuantile75 from './__fixtures__/monitor-operations-quantil-75.json';
import fixtureMonitorOperationsQuantile95 from './__fixtures__/monitor-operations-quantil-95.json';
import fixtureMonitorServiceCalls from './__fixtures__/monitor-service-calls.json';
import fixtureMonitorServiceErrors from './__fixtures__/monitor-service-errors.json';
import fixtureMonitorServiceLatencyQuantile50 from './__fixtures__/monitor-service-latency-quantil-50.json';
import fixtureMonitorServiceLatencyQuantile75 from './__fixtures__/monitor-service-latency-quantil-75.json';
import fixtureMonitorServiceLatencyQuantile95 from './__fixtures__/monitor-service-latency-quantil-95.json';
import { MonitorOperations, MonitorServiceCalls, MonitorServiceErrors, MonitorServiceLatency } from './Monitor';

import { spanKinds } from '../utils/utils';

describe('MonitorOperations', () => {
  const render = (): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      if (path.includes('quantile=0.5')) {
        return fixtureMonitorOperationsQuantile50;
      }

      if (path.includes('quantile=0.75')) {
        return fixtureMonitorOperationsQuantile75;
      }

      if (path.includes('quantile=0.95')) {
        return fixtureMonitorOperationsQuantile95;
      }

      if (path.includes('metric=errors')) {
        return fixtureMonitorOperationsErrors;
      }

      if (path.includes('metric=calls')) {
        return fixtureMonitorOperationsCalls;
      }

      return [];
    });

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <MonitorOperations
              title="Operations"
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/jaeger/name/jaeger',
                name: 'jaeger',
                options: {
                  address: 'https://www.jaegertracing.io/',
                },
                type: 'jaeger',
              }}
              service="myservice1"
              showActions={true}
              spanKinds={spanKinds}
              times={{
                time: 'last15Minutes',
                timeEnd: 0,
                timeStart: 0,
              }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render operations', async () => {
    render();
    expect(await waitFor(() => screen.getByText('Operations'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('ssh.connection'))).toBeInTheDocument();

    await userEvent.click(screen.getByText(/ssh.connection/));
    expect(await waitFor(() => screen.getAllByText(/ssh.connection/).length)).toBe(2);
  });
});

describe('MonitorServiceCalls', () => {
  const render = (): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      return fixtureMonitorServiceCalls;
    });

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <MonitorServiceCalls
              title="Request Rate (req/s)"
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/jaeger/name/jaeger',
                name: 'jaeger',
                options: {
                  address: 'https://www.jaegertracing.io/',
                },
                type: 'jaeger',
              }}
              service="myservice1"
              showActions={true}
              spanKinds={spanKinds}
              times={{
                time: 'last15Minutes',
                timeEnd: 0,
                timeStart: 0,
              }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render service calls', async () => {
    render();
    expect(await waitFor(() => screen.getByText('Request Rate (req/s)'))).toBeInTheDocument();
  });
});

describe('MonitorServiceErrors', () => {
  const render = (): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      return fixtureMonitorServiceErrors;
    });

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <MonitorServiceErrors
              title="Error Rate (%)"
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/jaeger/name/jaeger',
                name: 'jaeger',
                options: {
                  address: 'https://www.jaegertracing.io/',
                },
                type: 'jaeger',
              }}
              service="myservice1"
              showActions={true}
              spanKinds={spanKinds}
              times={{
                time: 'last15Minutes',
                timeEnd: 0,
                timeStart: 0,
              }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render service errors', async () => {
    render();
    expect(await waitFor(() => screen.getByText('Error Rate (%)'))).toBeInTheDocument();
  });
});

describe('MonitorServiceLatency', () => {
  const render = (): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      if (path.includes('quantile=0.5')) {
        return fixtureMonitorServiceLatencyQuantile50;
      }

      if (path.includes('quantile=0.75')) {
        return fixtureMonitorServiceLatencyQuantile75;
      }

      if (path.includes('quantile=0.95')) {
        return fixtureMonitorServiceLatencyQuantile95;
      }

      return [];
    });

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <MonitorServiceLatency
              title="Latency (ms)"
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/jaeger/name/jaeger',
                name: 'jaeger',
                options: {
                  address: 'https://www.jaegertracing.io/',
                },
                type: 'jaeger',
              }}
              service="myservice1"
              showActions={true}
              spanKinds={spanKinds}
              times={{
                time: 'last15Minutes',
                timeEnd: 0,
                timeStart: 0,
              }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render service latency', async () => {
    render();
    expect(await waitFor(() => screen.getByText('Latency (ms)'))).toBeInTheDocument();
  });
});
