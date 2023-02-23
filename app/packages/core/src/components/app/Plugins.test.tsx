import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import { vi } from 'vitest';

import Plugins from './Plugins';

import { APIClient, APIContext } from '../../context/APIContext';
import { PluginContextProvider, IPluginInstance } from '../../context/PluginContext';
import QueryClientProvider from '../../utils/QueryClientProvider';

describe('Plugins', () => {
  const render = (instances: IPluginInstance[], children?: ReactNode): Promise<RenderResult> => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    getSpy.mockResolvedValueOnce(instances);

    const result = _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <PluginContextProvider plugins={[]}>
              <Plugins />
              {children}
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

    const searchInput = screen.getByLabelText('Search');
    await userEvent.type(searchInput, 'unique');

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
    expect(screen.queryByText(/foo-instance-8/)).toBeNull();
    const perPageButton = screen.getByRole('button', { name: '8 per page' });
    await userEvent.click(perPageButton);
    const sixteenPerPageOption = screen.getByRole('option', { name: '16 per page' });
    await userEvent.click(sixteenPerPageOption);
    expect(screen.getByText(/foo-instance-0/)).toBeInTheDocument();
    expect(screen.getByText(/foo-instance-15/)).toBeInTheDocument();
  });

  it('should persist the search state in URLSearchParams', async () => {
    const RenderQueryString = () => {
      const [params] = useSearchParams();
      return <>{`${params}`}</>;
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
    const clusterInput = screen.getByLabelText('Cluster');
    await userEvent.type(clusterInput, 'oth');
    const clusterOption = screen.getByRole('option', { name: 'other' });
    await userEvent.click(clusterOption);

    // plugin type input
    const pluginInput = screen.getByLabelText('Plugin');
    await userEvent.type(pluginInput, 'b');
    const pluginOption = screen.getByRole('option', { name: 'foobar' });
    await userEvent.click(pluginOption);

    // search input
    const searchInput = screen.getByLabelText('Search');
    await userEvent.type(searchInput, 'instance');

    // per page button
    const perPageButton = screen.getByRole('button', { name: '8 per page' });
    await userEvent.click(perPageButton);
    const sixteenPerPageOption = screen.getByRole('option', { name: '16 per page' });
    await userEvent.click(sixteenPerPageOption);

    // page button
    const nextPage = screen.getByLabelText('Go to next page');
    await userEvent.click(nextPage);

    expect(screen.getByText('page=2&perPage=16&clusters=other&pluginTypes=foobar&search=instance')).toBeInTheDocument();
  });
});
