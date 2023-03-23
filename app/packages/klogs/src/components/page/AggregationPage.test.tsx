import { APIClient, APIContext, QueryClientProvider } from '@kobsio/core';
import { render as _render, screen, waitFor } from '@testing-library/react';
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

  const render = (initialQuery = '') => {
    const RenderQueryString = () => {
      const [params] = useSearchParams();
      return <>{decodeURI(`${params}`)}</>;
    };

    const result = _render(
      <MemoryRouter initialEntries={[initialQuery]}>
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

    return result;
  };

  it('should render pie chart form', async () => {
    render('/?chart=pie');

    expect(screen.getByLabelText(/Slize By/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Size by operation/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Size By field/)).toBeInTheDocument();
  });

  it('should render bar chart options', async () => {
    render('/?chart=bar&verticalAxisOperation=min');

    expect(screen.getByLabelText(/Horizontal axis operation/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Vertical axis operation/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Vertical axis field/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Break down by fields/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Break down by filters/)).toBeInTheDocument();
  });

  it('should render bar chart options (when top is the horizontal axis operation', async () => {
    render('/?chart=bar&horizontalAxisOperation=top');
    expect(screen.getByLabelText(/Horizontal axis field/)).toBeInTheDocument();
  });

  it('should render line chart options', async () => {
    render('/?chart=line');

    expect(screen.getByLabelText(/Horizontal axis operation/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Vertical axis operation/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Break down by fields/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Break down by filters/)).toBeInTheDocument();
  });

  it('should render area chart options', async () => {
    render('/?chart=area');

    expect(screen.getByLabelText(/Horizontal axis operation/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Vertical axis operation/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Break down by fields/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Break down by filters/)).toBeInTheDocument();
  });

  it('should set sensible defaults when chart is changed from line to bar', async () => {
    render('/?chart=line&horizontalAxisOperation=top&verticalAxisOperation=min');

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

  it('should unset fields when chart is switched from anything to pie', async () => {
    render('/?breakDownByFields[]=app&chart=area&horizontalAxisOperation=time&verticalAxisOperation=count');
    await waitFor(() => {
      expect(screen.getByText('area')).toBeInTheDocument();
    });

    const chartSelect = screen.getByLabelText('Chart');
    await userEvent.click(chartSelect);

    const pie = await waitFor(() => screen.getByRole('option', { name: 'pie' }));
    await userEvent.click(pie);

    expect(screen.getByText(/chart=pie/)).toBeInTheDocument();
    expect(screen.getByText(/sizeByOperation=count/)).toBeInTheDocument();
    expect(screen.queryByText(/breakDownByFields/)).toBeNull();
    expect(screen.queryByText(/horizontalAxisOperation/)).toBeNull();
    expect(screen.queryByText(/verticalAxisOperation/)).toBeNull();
  });

  it('should persist breakDownByFilters when the user switches between compatible chart types', async () => {
    render(
      '/?breakDownByFields[]=container_name&breakDownByFilters[]=myfirstfilter&chart=bar&horizontalAxisOperation=time&query=namespace%3D%27kobs%27&verticalAxisOperation=count',
    );

    const chartSelect = screen.getByLabelText('Chart');
    await userEvent.click(chartSelect);

    const areaOption = await waitFor(() => screen.getByRole('option', { name: 'area' }));
    await userEvent.click(areaOption);

    expect(screen.getByText(/chart=area/)).toBeInTheDocument();
    expect(screen.getByText(/horizontalAxisOperation=time/)).toBeInTheDocument();
    expect(screen.getByText(/verticalAxisOperation=count/)).toBeInTheDocument();
    expect(screen.getByText(/query=namespace%3D'kobs'/)).toBeInTheDocument();
    expect(screen.getByText(/breakDownByFields\[\]=container_name/)).toBeInTheDocument();
    expect(screen.getByText(/breakDownByFilters\[\]=myfirstfilter/)).toBeInTheDocument();
  });

  it('should suggest columns in the breakDownByFields input', async () => {
    getSpy.mockResolvedValueOnce(['column_suggestions']);
    render('/?chart=bar');

    const breakDownByFieldsSelect = screen.getByLabelText('Break down by fields');
    await userEvent.click(breakDownByFieldsSelect);

    expect(screen.getByText('column_suggestions')).toBeInTheDocument();
  });
});
