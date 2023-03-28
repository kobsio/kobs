import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import JaegerPanel from './JaegerPanel';

vi.mock('./Traces', () => {
  return {
    Traces: () => {
      return <>mocked traces</>;
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

describe('JaegerPanel', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (options: any): RenderResult => {
    return _render(
      <MemoryRouter>
        <JaegerPanel
          title="Test"
          instance={{
            cluster: 'hub',
            id: '/cluster/hub/type/jaeger/name/jaeger',
            name: 'jaeger',
            options: {
              address: 'https://www.jaegertracing.io/',
            },
            type: 'jaeger',
          }}
          options={options}
          times={{
            time: 'last15Minutes',
            timeEnd: 0,
            timeStart: 0,
          }}
          setTimes={() => {
            // nothing
          }}
        />
      </MemoryRouter>,
    );
  };

  it('should render error on missing options', async () => {
    render(undefined);
    expect(await waitFor(() => screen.getByText('Invalid options for Jaeger plugin'))).toBeInTheDocument();
  });

  it('should render traces for single query', async () => {
    render({ queries: [{ name: 'Query 1' }] });

    expect(await waitFor(() => screen.getByText(/mocked traces/))).toBeInTheDocument();
  });

  it('should render traces for multiple queries', async () => {
    render({ queries: [{ name: 'Query 1' }, { name: 'Query 2' }] });

    expect(await waitFor(() => screen.getByText(/Query 1/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Query 2/))).toBeInTheDocument();
  });

  it('should render service latency', async () => {
    render({ metrics: { service: 'myservice1', type: 'servicelatency' } });

    expect(await waitFor(() => screen.getByText(/mocked service latency/))).toBeInTheDocument();
  });

  it('should render service errors', async () => {
    render({ metrics: { service: 'myservice1', type: 'serviceerrors' } });

    expect(await waitFor(() => screen.getByText(/mocked service errors/))).toBeInTheDocument();
  });

  it('should render service calls', async () => {
    render({ metrics: { service: 'myservice1', type: 'servicecalls' } });

    expect(await waitFor(() => screen.getByText(/mocked service calls/))).toBeInTheDocument();
  });

  it('should render operations', async () => {
    render({ metrics: { service: 'myservice1', type: 'operations' } });

    expect(await waitFor(() => screen.getByText(/mocked operations/))).toBeInTheDocument();
  });
});
