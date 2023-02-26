import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as _render, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { vi } from 'vitest';

import ResourcesClusters from './ResourcesClusters';

import { APIClient, APIContext, queryClientOptions } from '../../context/APIContext';

describe('ResourcesClusters', () => {
  const render = async (
    clusters: string[],
    selectedClusters: string[],
    selectClusters: (clusters: string[]) => void,
  ): Promise<RenderResult> => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    getSpy.mockResolvedValueOnce(clusters);

    const result = _render(
      <QueryClientProvider client={new QueryClient(queryClientOptions)}>
        <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
          <ResourcesClusters selectClusters={selectClusters} selectedClusters={selectedClusters} />
        </APIContext.Provider>
      </QueryClientProvider>,
    );

    expect(getSpy).toHaveBeenCalled();
    return result;
  };

  it('should render no options', async () => {
    await render([], [], () => {
      // noop
    });

    const clustersInput = screen.getByLabelText('Clusters');
    await userEvent.type(clustersInput, 'test');
    expect(screen.getByText(/No options/)).toBeInTheDocument();
  });

  it('should render clusters', async () => {
    await render(['cluster1', 'cluster2'], [], () => {
      // noop
    });

    const clustersInput = screen.getByLabelText('Clusters');
    await userEvent.type(clustersInput, 'cluster');
    expect(screen.getByText(/cluster1/)).toBeInTheDocument();
    expect(screen.getByText(/cluster2/)).toBeInTheDocument();
  });

  it('should call selectCluster', async () => {
    const selectCluster = vi.fn();

    await render(['cluster1', 'cluster2'], [], selectCluster);

    const clustersInput = screen.getByLabelText('Clusters');
    await userEvent.type(clustersInput, 'cluster');

    const cluster1Option = screen.getByRole('option', { name: 'cluster1' });
    await userEvent.click(cluster1Option);

    expect(selectCluster).toHaveBeenCalledTimes(1);
    expect(selectCluster).toHaveBeenCalledWith(['cluster1']);
  });
});
