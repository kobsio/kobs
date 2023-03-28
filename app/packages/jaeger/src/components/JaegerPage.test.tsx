import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import JaegerPage from './JaegerPage';

import { description } from '../utils/utils';

vi.mock('./Traces', () => {
  return {
    Traces: () => {
      return <>mocked traces</>;
    },
  };
});

vi.mock('./Trace', () => {
  return {
    TraceID: () => {
      return <>mocked trace</>;
    },
  };
});

vi.mock('./Monitor', () => {
  return {
    MonitorOperations: () => {
      return <>mocked operations</>;
    },
    MonitorServiceCalls: () => {
      return <>mocked service calls</>;
    },
    MonitorServiceErrors: () => {
      return <>mocked service errors</>;
    },
    MonitorServiceLatency: () => {
      return <>mocked service latency</>;
    },
  };
});

describe('JaegerPage', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (path: string): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      if (path.startsWith('/api/plugins/sonarqube/projects')) {
        return { data: ['myservice1', 'myservice2'] };
      }

      return [];
    });

    return _render(
      <MemoryRouter initialEntries={[path]}>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <JaegerPage
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/jaeger/name/jaeger',
                name: 'jaeger',
                type: 'jaeger',
              }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render traces page with info that service is required', async () => {
    render('/');

    expect(screen.getByText('jaeger')).toBeInTheDocument();
    expect(screen.getByText('(hub / jaeger)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('Select a service'))).toBeInTheDocument();
  });

  it('should render traces page', async () => {
    render('/?service=myservice1');

    expect(screen.getByText('jaeger')).toBeInTheDocument();
    expect(screen.getByText('(hub / jaeger)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('mocked traces'))).toBeInTheDocument();
  });

  it('should render trace page with trace selection', async () => {
    render('/trace');

    expect(screen.getByText('jaeger')).toBeInTheDocument();
    expect(screen.getByText('(hub / jaeger)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByPlaceholderText('Provide a Trace ID'))).toBeInTheDocument();
  });

  it('should render trace page with trace', async () => {
    render('/trace/mytraceid');

    expect(await waitFor(() => screen.getByText('mocked trace'))).toBeInTheDocument();
  });

  it('should render monitor page with info that service is required', async () => {
    render('/monitor');

    expect(screen.getByText('jaeger')).toBeInTheDocument();
    expect(screen.getByText('(hub / jaeger)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('Select a service and span kinds'))).toBeInTheDocument();
  });

  it('should render monitor page', async () => {
    render('/monitor?service=myservice1');

    expect(screen.getByText('jaeger')).toBeInTheDocument();
    expect(screen.getByText('(hub / jaeger)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('mocked operations'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('mocked service latency'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('mocked service errors'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('mocked service calls'))).toBeInTheDocument();
  });
});
