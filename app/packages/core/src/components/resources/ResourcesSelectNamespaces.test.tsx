import { render as _render, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { vi } from 'vitest';

import ResourcesSelectNamespaces from './ResourcesSelectNamespaces';

import { APIClient, APIContext } from '../../context/APIContext';
import { QueryClientProvider } from '../../context/QueryClientProvider';

describe('ResourcesSelectNamespaces', () => {
  const render = async (
    namespaces: string[],
    selectedClusters: string[],
    selectedNamespaces: string[],
    selectNamespaces: (namespace: string[]) => void,
  ): Promise<RenderResult> => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    getSpy.mockResolvedValueOnce(namespaces);

    const result = _render(
      <QueryClientProvider>
        <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
          <ResourcesSelectNamespaces
            selectNamespaces={selectNamespaces}
            selectedNamespaces={selectedNamespaces}
            selectedClusters={selectedClusters}
          />
        </APIContext.Provider>
      </QueryClientProvider>,
    );

    expect(getSpy).toHaveBeenCalled();
    return result;
  };

  it('should render no options', async () => {
    await render([], [], [], () => {
      // noop
    });

    const namespacesInput = screen.getByLabelText('Namespaces');
    await userEvent.type(namespacesInput, 'test');
    expect(screen.getByText(/No options/)).toBeInTheDocument();
  });

  it('should render namespaces', async () => {
    await render(['namespace1', 'namespace2'], [], [], () => {
      // noop
    });

    const namespacesInput = screen.getByLabelText('Namespaces');
    await userEvent.type(namespacesInput, 'namespace');
    expect(screen.getByText(/namespace1/)).toBeInTheDocument();
    expect(screen.getByText(/namespace2/)).toBeInTheDocument();
  });

  it('should call selectNamespace', async () => {
    const selectNamespace = vi.fn();

    await render(['namespace1', 'namespace2'], [], [], selectNamespace);

    const namespacesInput = screen.getByLabelText('Namespaces');
    await userEvent.type(namespacesInput, 'namespace');

    const namespace1Option = screen.getByRole('option', { name: 'namespace1' });
    await userEvent.click(namespace1Option);

    expect(selectNamespace).toHaveBeenCalledTimes(1);
    expect(selectNamespace).toHaveBeenCalledWith(['namespace1']);
  });
});
