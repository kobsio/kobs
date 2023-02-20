import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import Plugins from './Plugins';

import { PluginContextProvider, IPluginInstance } from '../../context/PluginContext';
import QueryClientProvider from '../../utils/QueryClientProvider';
import Client from '../api/api';
import { APIContext } from '../api/context';

describe('Plugins', () => {
  const render = (instances: IPluginInstance[]): Promise<RenderResult> => {
    const apiClient: Client = new Client();
    const getSpy = vi.spyOn(apiClient, 'get');
    getSpy.mockResolvedValueOnce(instances);

    const result = _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ api: apiClient }}>
            <PluginContextProvider plugins={[]}>
              <Plugins />
            </PluginContextProvider>
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );

    return waitFor(() => screen.getByText(/A list of all available plugins/)).then(() => result);
  };

  it('should render all plugins', async () => {
    await render([
      {
        cluster: 'dev',
        id: 'foo',
        name: 'foo instance',
        type: 'foo',
      },
      {
        cluster: 'dev',
        id: 'bar',
        name: 'bar instance',
        type: 'bar',
      },
    ]);

    expect(screen.getByText(/foo instance/)).toBeInTheDocument();
    expect(screen.getByText(/bar instance/)).toBeInTheDocument();
  });

  it('should filter by cluster', async () => {
    await render([
      {
        cluster: 'dev',
        id: 'foo',
        name: 'foo instance',
        type: 'foo',
      },
      {
        cluster: 'prod',
        id: 'bar',
        name: 'bar instance',
        type: 'bar',
      },
    ]);

    const clusterInput = screen.getByLabelText('Cluster');
    await userEvent.type(clusterInput, 'dev');

    const clusterOption = screen.getByRole('option', { name: 'dev' });
    await userEvent.click(clusterOption);

    expect(screen.getByText(/foo instance/)).toBeInTheDocument();
    expect(screen.queryByText(/bar instance/)).toBeNull();
  });

  it('should filter by plugin type', async () => {
    await render([
      {
        cluster: 'dev',
        id: 'foo',
        name: 'foo instance',
        type: 'foo',
      },
      {
        cluster: 'prod',
        id: 'bar',
        name: 'bar instance',
        type: 'bar',
      },
    ]);

    const pluginInput = screen.getByLabelText('Plugin');
    await userEvent.type(pluginInput, 'b');

    const clusterOption = screen.getByRole('option', { name: 'bar' });
    await userEvent.click(clusterOption);

    expect(screen.getByText(/bar instance/)).toBeInTheDocument();
    expect(screen.queryByText(/foo instance/)).toBeNull();
  });

  it('should filter by search', async () => {
    await render([
      {
        cluster: 'dev',
        id: 'foo',
        name: 'foo instance superuniquestring',
        type: 'foo',
      },
      {
        cluster: 'prod',
        id: 'bar',
        name: 'bar instance',
        type: 'bar',
      },
    ]);

    const searchInput = screen.getByLabelText('Search');
    await userEvent.type(searchInput, 'unique');

    expect(screen.getByText(/foo instance/)).toBeInTheDocument();
    expect(screen.queryByText(/bar instance/)).toBeNull();
  });
});
