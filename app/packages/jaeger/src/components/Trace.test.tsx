import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { VirtuosoMockContext } from 'react-virtuoso';
import { vi } from 'vitest';

import fixtureTrace from './__fixtures__/trace.json';
import { TraceID, TraceData } from './Trace';

describe('TraceID', () => {
  const render = (): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      return fixtureTrace;
    });

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <VirtuosoMockContext.Provider value={{ itemHeight: 100, viewportHeight: 1000 }}>
              <TraceID
                instance={{
                  cluster: 'hub',
                  id: '/cluster/hub/type/jaeger/name/jaeger',
                  name: 'jaeger',
                  options: {
                    address: 'https://www.jaegertracing.io/',
                  },
                  type: 'jaeger',
                }}
                traceID="e7845d5e5093156d71e6753f6ba2b38c"
              />
            </VirtuosoMockContext.Provider>
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render traces', async () => {
    render();
    expect(await waitFor(() => screen.getByText(/csvupload: ssh.connection/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/e7845d5e5093156d71e6753f6ba2b38c/))).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText(/Trace Start/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Duration/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Services/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Total Spans/))).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText(/ssh.auth.password/))).toBeInTheDocument();

    await userEvent.click(screen.getByText(/ssh.auth.password/));
    expect(await waitFor(() => screen.getByText(/Process/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Tags/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Logs/))).toBeInTheDocument();
    await userEvent.click(screen.getByText(/host.name=csvupload-55b9df7876-p4tjl/));
    expect(await waitFor(() => screen.getByText(/Copy/))).toBeInTheDocument();
  });
});

describe('TraceData', () => {
  const render = (): RenderResult => {
    const client = new APIClient();

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <VirtuosoMockContext.Provider value={{ itemHeight: 100, viewportHeight: 1000 }}>
              <TraceData
                instance={{
                  cluster: 'hub',
                  id: '/cluster/hub/type/jaeger/name/jaeger',
                  name: 'jaeger',
                  options: {
                    address: 'https://www.jaegertracing.io/',
                  },
                  type: 'jaeger',
                }}
                traceData={JSON.parse(
                  `{"processes":{"p1":{"serviceName":"csvupload","tags":[{"key":"container.id","type":"string","value":"950a1da905d2ba2a08ac6553f2209878d59f0868d764b81eeb8c048fa98c7bd1"},{"key":"host.name","type":"string","value":"csvupload-55b9df7876-p4tjl"},{"key":"os.description","type":"string","value":"Alpine Linux 3.17.2 (Linux csvupload-55b9df7876-p4tjl 5.4.0-1104-azure #110~18.04.1-Ubuntu SMP Sat Feb 11 17:41:21 UTC 2023 x86_64)"},{"key":"os.type","type":"string","value":"linux"},{"key":"process.executable.name","type":"string","value":"csvupload"},{"key":"process.executable.path","type":"string","value":"/app/csvupload"},{"key":"process.owner","type":"string","value":"nobody"},{"key":"process.pid","type":"int64","value":1},{"key":"process.runtime.description","type":"string","value":"go version go1.20.2 linux/amd64"},{"key":"process.runtime.name","type":"string","value":"go"},{"key":"process.runtime.version","type":"string","value":"go1.20.2"},{"key":"telemetry.sdk.language","type":"string","value":"go"},{"key":"telemetry.sdk.name","type":"string","value":"opentelemetry"},{"key":"telemetry.sdk.version","type":"string","value":"1.14.0"}]}},"spans":[{"duration":2000285,"flags":1,"logs":[{"fields":[{"key":"event","type":"string","value":"exception"},{"key":"exception.message","type":"string","value":"password rejected for root"},{"key":"exception.type","type":"string","value":"*errors.errorString"}],"timestamp":1679976157149898}],"operationName":"ssh.auth.password","processID":"p1","references":[{"refType":"CHILD_OF","spanID":"be9404584e0805fe","traceID":"e7845d5e5093156d71e6753f6ba2b38c"}],"spanID":"a560d333d9b16ac2","startTime":1679976157149884,"tags":[{"key":"otel.library.name","type":"string","value":"sftp"},{"key":"error","type":"bool","value":true},{"key":"otel.status_code","type":"string","value":"ERROR"},{"key":"otel.status_description","type":"string","value":"password rejected for root"},{"key":"internal.span.format","type":"string","value":"jaeger"}],"traceID":"e7845d5e5093156d71e6753f6ba2b38c","warnings":null},{"duration":51331061,"flags":1,"logs":[],"operationName":"ssh.connection","processID":"p1","references":[],"spanID":"be9404584e0805fe","startTime":1679976108069855,"tags":[{"key":"net.transport","type":"string","value":"ip_tcp"},{"key":"remoteAddress","type":"string","value":"127.0.0.6:59219"},{"key":"sessionId","type":"string","value":"4f3db0aa-32c2-41bb-b9ef-5f3d6fd1dafd"},{"key":"otel.library.name","type":"string","value":"sftp"},{"key":"internal.span.format","type":"string","value":"jaeger"}],"traceID":"e7845d5e5093156d71e6753f6ba2b38c","warnings":null}],"traceID":"e7845d5e5093156d71e6753f6ba2b38c","warnings":null}`,
                )}
              />
            </VirtuosoMockContext.Provider>
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render traces', async () => {
    render();
    expect(await waitFor(() => screen.getByText(/csvupload: ssh.connection/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/e7845d5e5093156d71e6753f6ba2b38c/))).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText(/Trace Start/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Duration/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Services/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Total Spans/))).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText(/ssh.auth.password/))).toBeInTheDocument();

    await userEvent.click(screen.getByText(/ssh.auth.password/));
    expect(await waitFor(() => screen.getByText(/Process/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Tags/))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/Logs/))).toBeInTheDocument();
    await userEvent.click(screen.getByText(/host.name=csvupload-55b9df7876-p4tjl/));
    expect(await waitFor(() => screen.getByText(/Copy/))).toBeInTheDocument();
  });
});
