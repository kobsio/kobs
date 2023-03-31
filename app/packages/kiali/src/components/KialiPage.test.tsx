import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import KialiPage from './KialiPage';

import { description } from '../utils/utils';

vi.mock('./Topology', () => {
  return {
    Topology: () => {
      return <>mocked topology</>;
    },
  };
});

describe('KialiPage', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      if (path.startsWith('/api/plugins/kiali/namespaces')) {
        return ['namespace1', 'namespace2'];
      }

      return [];
    });

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <KialiPage
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/kiali/name/kiali',
                name: 'kiali',
                type: 'kiali',
              }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render info that at least one namespace must be selected', async () => {
    render();

    expect(screen.getByText('kiali')).toBeInTheDocument();
    expect(screen.getByText('(hub / kiali)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('Select a namespace'))).toBeInTheDocument();
  });

  it('should render topology after user selected a namespace', async () => {
    render();

    expect(screen.getByText('kiali')).toBeInTheDocument();
    expect(screen.getByText('(hub / kiali)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('Select a namespace'))).toBeInTheDocument();

    const namespacesInput = screen.getByLabelText('Namespaces');
    await userEvent.type(namespacesInput, 'namespace');
    expect(screen.getByText(/namespace1/)).toBeInTheDocument();

    const namespace1Option = screen.getByRole('option', { name: 'namespace1' });
    await userEvent.click(namespace1Option);

    expect(await waitFor(() => screen.getByText('mocked topology'))).toBeInTheDocument();
  });
});
