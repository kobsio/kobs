import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import fixtureLogs from './__fixtures__/logs.json';
import KLogsPanel from './KLogsPanel';

vi.mock('./Aggregation', () => {
  return {
    Aggregation: () => {
      return <>mocked aggregation</>;
    },
  };
});

describe('KLogsPanel', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (options: any): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    getSpy.mockResolvedValue(fixtureLogs);

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <KLogsPanel
              title="Test"
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/klogs/name/klogs',
                name: 'klogs',
                type: 'klogs',
              }}
              options={options}
              times={{
                time: 'last15Minutes',
                timeEnd: 0,
                timeStart: 0,
              }}
              setTimes={vi.fn()}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render error on missing options', async () => {
    render(undefined);
    expect(await waitFor(() => screen.getByText('Invalid options for klogs plugin'))).toBeInTheDocument();
  });

  it('should render aggregation', async () => {
    render({ aggregation: { chart: 'pie' }, type: 'aggregation' });
    expect(await waitFor(() => screen.getByText('mocked aggregation'))).toBeInTheDocument();
  });

  it('should render single log query', async () => {
    render({ queries: [{ name: 'test', query: '' }], type: 'logs' });
    expect(await waitFor(() => screen.getByText('temporal-frontend-7bc8d88ffc-wr87n'))).toBeInTheDocument();
  });

  it('should render multiple log queries', async () => {
    render({
      queries: [
        { name: 'my test query 1', query: '' },
        { name: 'my test query 2', query: '' },
      ],
      type: 'logs',
    });

    expect(await waitFor(() => screen.getByText('my test query 1'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('my test query 2'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('temporal-frontend-7bc8d88ffc-wr87n'))).toBeInTheDocument();

    const tab = screen.getByText('my test query 2');
    userEvent.click(tab);

    expect(await waitFor(() => screen.getByText('my test query 1'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('my test query 2'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('temporal-frontend-7bc8d88ffc-wr87n'))).toBeInTheDocument();
  });
});
