import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import KialiPanel from './KialiPanel';

vi.mock('./Topology', () => {
  return {
    Topology: () => {
      return <>mocked topology</>;
    },
  };
});

describe('KialiPanel', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (options: any): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      return [];
    });

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <KialiPanel
              title="Test"
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/kiali/name/kiali',
                name: 'kiali',
                type: 'kiali',
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
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render error on missing options', async () => {
    render(undefined);
    expect(await waitFor(() => screen.getByText('Invalid options for Kiali plugin'))).toBeInTheDocument();
  });

  it('should render topology', async () => {
    render({ namespaces: ['namespace1'] });

    expect(await waitFor(() => screen.getByText(/mocked topology/))).toBeInTheDocument();
  });

  it('should render topology for application', async () => {
    render({ application: 'application1', namespaces: ['namespace1'] });

    expect(await waitFor(() => screen.getByText(/mocked topology/))).toBeInTheDocument();
  });
});
