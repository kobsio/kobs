import { APIClient, APIContext, QueryClientProvider } from '@kobsio/core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import { vi } from 'vitest';

import AggregationPage from './AggregationPage';

vi.mock('./InternalEditor', () => {
  return {
    default: () => {
      return <>mock editor</>;
    },
  };
});

describe('AggregationPage', () => {
  const apiClient = new APIClient();
  const getSpy = vi.spyOn(apiClient, 'get');

  it('should set sensible defaults when chart is changed from pie to bar', async () => {
    const RenderQueryString = () => {
      const [params] = useSearchParams();
      return <>{decodeURI(`${params}`)}</>;
    };
    getSpy.mockResolvedValueOnce(['column_suggestion']);

    render(
      <MemoryRouter initialEntries={['/?chart=line&horizontalAxisOperation=top&verticalAxisOperation=min']}>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: apiClient, getUser: vi.fn() }}>
            <AggregationPage instance={{ cluster: 'cluster', id: 'id', name: 'name', type: 'type' }} />
            <RenderQueryString />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByText('Fast, scalable and reliable logging using Fluent Bit and ClickHouse.'),
    ).toBeInTheDocument();

    // wait for component update
    await waitFor(() => {
      expect(screen.getByText('line')).toBeInTheDocument();
    });

    const chartSelect = screen.getByLabelText('Chart');
    await userEvent.click(chartSelect);

    const barOption = await waitFor(() => screen.getByRole('option', { name: 'bar' }));
    await userEvent.click(barOption);

    expect(screen.getByText(/chart=bar/)).toBeInTheDocument();
    expect(screen.getByText(/horizontalAxisOperation=time/)).toBeInTheDocument();
    expect(screen.getByText(/verticalAxisOperation=count/)).toBeInTheDocument();
  });
});
