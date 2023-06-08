import { QueryClientProvider } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import AzurePanel from './AzurePanel';

vi.mock('./CostManagement', () => {
  return {
    CostManagement: () => {
      return <>CostManagement</>;
    },
  };
});

vi.mock('./Metrics', () => {
  return {
    Metrics: () => {
      return <>Metrics</>;
    },
  };
});

describe('AzurePanel', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (options: any): RenderResult => {
    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <AzurePanel
            title="Test"
            instance={{
              cluster: 'hub',
              id: '/cluster/hub/type/azure/name/azure',
              name: 'azure',
              options: {
                address: 'https://sonarcloud.io',
              },
              type: 'azure',
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
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render error on missing options', async () => {
    render(undefined);
    expect(await waitFor(() => screen.getByText('Invalid options for Azure plugin'))).toBeInTheDocument();
  });

  it('should render cost management panel', async () => {
    render({ service: 'Cost Management' });

    expect(await waitFor(() => screen.getByText(/CostManagement/))).toBeInTheDocument();
  });

  it('should render metrics panel', async () => {
    render({
      aggregationType: 'test',
      metric: 'test',
      provider: 'test',
      resourceGroup: 'test',
      service: 'Metrics',
    });

    expect(await waitFor(() => screen.getByText(/Metrics/))).toBeInTheDocument();
  });
});
