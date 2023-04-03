import { APIClient, APIContext, QueryClientProvider } from '@kobsio/core';
import { render as _render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import AggregationPanel, { IOptions } from './AggregationPanel';

describe('AggregationPanel', () => {
  const apiClient = new APIClient();
  const postSpy = vi.spyOn(apiClient, 'post');

  // disable the rule, because the tests must be able to pass invalid objects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (options: any) => {
    return _render(
      <QueryClientProvider>
        <APIContext.Provider value={{ client: apiClient, getUser: vi.fn() }}>
          <AggregationPanel
            options={options}
            instance={{ cluster: 'cluster', id: 'id', name: 'name', type: 'type' }}
            setTimes={vi.fn()}
            times={{ time: 'last15Minutes', timeEnd: 1, timeStart: 0 }}
            title="my panel"
          />
        </APIContext.Provider>
      </QueryClientProvider>,
    );
  };

  it('should render the panel', () => {
    postSpy.mockResolvedValueOnce('lsjkdgjho');
    const result = render({
      chart: 'pie',
      query: "foo = 'bar'",
      sizeByField: '',
      sizeByOperation: 'count',
      sliceBy: 'app',
      type: 'aggregation',
    } as IOptions);

    expect(result.queryAllByRole('presentation')).toBeDefined();
  });

  it('should render the panel error', async () => {
    postSpy.mockRejectedValueOnce(new Error());
    render({
      chart: 'pie',
      query: "foo = 'bar'",
      sizeByField: '',
      sizeByOperation: 'count',
      sliceBy: 'app',
      type: 'aggregation',
    } as IOptions);

    await waitFor(() => expect(screen.getByText(/Invalid options for klogs plugin/)).toBeInTheDocument());
  });
});
