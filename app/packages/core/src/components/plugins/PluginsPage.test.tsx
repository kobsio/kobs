import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import { vi } from 'vitest';

import PluginsPage from './PluginsPage';

import { APIClient, APIContext } from '../../context/APIContext';
import { PluginContextProvider, IPluginInstance } from '../../context/PluginContext';
import { QueryClientProvider } from '../../context/QueryClientProvider';

describe('PluginsPage', () => {
  const render = async (instances: IPluginInstance[], children?: ReactNode): Promise<RenderResult> => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    getSpy.mockResolvedValueOnce(instances);

    const result = _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <PluginContextProvider plugins={[]}>
              <PluginsPage />
              {children}
            </PluginContextProvider>
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );

    return waitFor(() => screen.getByText(/A list of all available plugins/)).then(() => result);
  };

  it('should render info when no plugins were found', async () => {
    await render([]);

    expect(screen.getByText(/No plugins were found/)).toBeInTheDocument();
  });

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

  it('should only render the first 8 plugins', async () => {
    await render([
      ...Array.from({ length: 8 }, (v, i) => ({
        cluster: 'dev',
        id: `foo-${i}`,
        name: `foo-instance-${i}`,
        type: 'foo',
      })),
      {
        cluster: 'prod',
        id: 'bar',
        name: 'item on the second page',
        type: 'bar',
      },
    ]);

    expect(screen.getByText(/foo-instance-0/)).toBeInTheDocument();
    expect(screen.getByText(/foo-instance-7/)).toBeInTheDocument();
    expect(screen.queryByText(/bar instance/)).toBeNull();
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

    const clusterInput = screen.getByLabelText('Clusters');
    await userEvent.type(clusterInput, 'dev');

    const clusterOption = screen.getByRole('option', { name: 'dev' });
    await userEvent.click(clusterOption);

    expect(screen.getByText(/foo instance/)).toBeInTheDocument();
    expect(screen.queryByText(/bar instance/)).toBeNull();
  });

  it('should filter by plugin types', async () => {
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

    const pluginInput = screen.getByLabelText('Plugin Types');
    await userEvent.type(pluginInput, 'b');

    const pluginOption = screen.getByRole('option', { name: 'bar' });
    await userEvent.click(pluginOption);

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

    const searchInput = screen.getByPlaceholderText('Search');
    await userEvent.type(searchInput, 'unique{enter}');

    expect(screen.getByText(/foo instance/)).toBeInTheDocument();
    expect(screen.queryByText(/bar instance/)).toBeNull();
  });

  it('should handle a change of the items per page', async () => {
    await render([
      ...Array.from({ length: 16 }, (v, i) => ({
        cluster: 'dev',
        id: `foo-${i}`,
        name: `foo-instance-${i}`,
        type: 'foo',
      })),
    ]);

    expect(screen.getByText(/foo-instance-0/)).toBeInTheDocument();
    expect(screen.getByText(/foo-instance-7/)).toBeInTheDocument();
    expect(screen.queryByText(/foo-instance-12/)).toBeNull();

    const perPageButton = screen.getByRole('button', { name: '1 - 10 of 16' });
    await userEvent.click(perPageButton);
    const twentyPerPageOption = screen.getByText('20 per page');
    await userEvent.click(twentyPerPageOption);

    expect(screen.getByText(/foo-instance-0/)).toBeInTheDocument();
    expect(screen.getByText(/foo-instance-15/)).toBeInTheDocument();
  });

  it('should persist the search state in URLSearchParams', async () => {
    // there is no window, therefore we just render the url search params into the DOM
    const RenderQueryString = () => {
      const [params] = useSearchParams();
      return <>{decodeURI(`${params}`)}</>;
    };

    await render(
      [
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
        ...Array.from({ length: 32 }, (v, i) => ({
          cluster: 'other',
          id: `foobar-${i}`,
          name: `foobar-instance-${i}`,
          type: 'foobar',
        })),
      ],
      <RenderQueryString />,
    );

    // cluster input
    const clusterInput = screen.getByLabelText('Clusters');
    await userEvent.type(clusterInput, 'oth');
    const clusterOption = screen.getByRole('option', { name: 'other' });
    await userEvent.click(clusterOption);

    // plugin type input
    const pluginInput = screen.getByLabelText('Plugin Types');
    await userEvent.type(pluginInput, 'b');
    const pluginOption = screen.getByRole('option', { name: 'foobar' });
    await userEvent.click(pluginOption);

    // search input
    const searchInput = screen.getByPlaceholderText('Search');
    await userEvent.type(searchInput, 'instance{enter}');

    // per page button
    const perPageButton = screen.getByRole('button', { name: '1 - 10 of 32' });
    await userEvent.click(perPageButton);
    const twentyPerPageOption = screen.getByText('20 per page');
    await userEvent.click(twentyPerPageOption);

    // page button
    const nextPage = screen.getByLabelText('Go to next page');
    await userEvent.click(nextPage);

    expect(screen.getByText(/clusters\[\]=other/)).toBeInTheDocument();
    expect(screen.getByText(/page=2/)).toBeInTheDocument();
    expect(screen.getByText(/perPage=20/)).toBeInTheDocument();
    expect(screen.getByText(/pluginTypes\[\]=foobar/)).toBeInTheDocument();
    expect(screen.getByText(/searchTerm=instance/)).toBeInTheDocument();
  });
});
