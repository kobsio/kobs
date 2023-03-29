import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { VirtuosoMockContext } from 'react-virtuoso';
import { vi } from 'vitest';

import fixtureTrace from './__fixtures__/trace.json';
import { Traces } from './Traces';

describe('Traces', () => {
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
              <Traces
                instance={{
                  cluster: 'hub',
                  id: '/cluster/hub/type/jaeger/name/jaeger',
                  name: 'jaeger',
                  options: {
                    address: 'https://www.jaegertracing.io/',
                  },
                  type: 'jaeger',
                }}
                limit=""
                maxDuration=""
                minDuration=""
                operation=""
                service="myservice1"
                showChart={true}
                tags=""
                times={{
                  time: 'last15Minutes',
                  timeEnd: 0,
                  timeStart: 0,
                }}
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

    await userEvent.click(screen.getByText(/csvupload: ssh.connection/));
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
