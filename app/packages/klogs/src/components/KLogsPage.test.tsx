import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import fixtureLogs from './__fixtures__/logs.json';
import KLogsPage from './KLogsPage';

import { description } from '../utils/utils';

vi.mock('./Aggregation', () => {
  return {
    Aggregation: () => {
      return <>mocked aggregation</>;
    },
  };
});

describe('KLogsPage', () => {
  const render = (path: string): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSpy.mockImplementation(async (path: string, _): Promise<any> => {
      if (path.startsWith('/api/plugins/klogs/logs')) {
        return fixtureLogs;
      }

      return [];
    });

    return _render(
      <MemoryRouter initialEntries={[path]}>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <KLogsPage
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/klogs/name/klogs',
                name: 'klogs',
                type: 'klogs',
              }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render logs', async () => {
    render('/');

    expect(screen.getByText('klogs')).toBeInTheDocument();
    expect(screen.getByText('(hub / klogs)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('temporal-frontend-7bc8d88ffc-wr87n'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText(/\d+ Documents in \d+ Milliseconds/))).toBeInTheDocument();

    const expandButton = screen.getByRole('button', { name: 'expand document' });
    userEvent.click(expandButton);

    expect(await waitFor(() => screen.getByText('Table'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('JSON'))).toBeInTheDocument();

    expect(
      await waitFor(() =>
        screen.getByText(
          ':authority,:path,:method,:scheme,content-type,te,user-agent,client-version,supported-server-versions,client-name,grpc-accept-encoding,grpc-timeout,x-forwarded-proto,x-request-id,x-envoy-decorator-operation,x-envoy-peer-metadata,x-envoy-peer-metadata-id,',
        ),
      ),
    ).toBeInTheDocument();

    const jsonTab = screen.getByText('JSON');
    userEvent.click(jsonTab);
  });

  it('should render pie chart', async () => {
    render('/aggregation?chart=pie&sizeByOperation=min');

    expect(screen.getByText('klogs')).toBeInTheDocument();
    expect(screen.getByText('(hub / klogs)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(screen.getByText('Slice by')).toBeInTheDocument();
    expect(screen.getByText('Size by operation')).toBeInTheDocument();
    expect(screen.getByText('Size by field')).toBeInTheDocument();
  });

  it('should render bar chart - time', async () => {
    render('/aggregation?chart=bar&verticalAxisOperation=min');

    expect(screen.getByText('klogs')).toBeInTheDocument();
    expect(screen.getByText('(hub / klogs)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(screen.getByText('Horizontal axis operation')).toBeInTheDocument();
    expect(screen.getByText('Vertical axis operation')).toBeInTheDocument();
    expect(screen.getByText('Vertical axis field')).toBeInTheDocument();
    expect(screen.getByText('Break down by fields')).toBeInTheDocument();
    expect(screen.getByText('Break down by filters')).toBeInTheDocument();
  });

  it('should render bar chart options - top', async () => {
    render('/aggregation?chart=bar&horizontalAxisOperation=top');

    expect(screen.getByText('klogs')).toBeInTheDocument();
    expect(screen.getByText('(hub / klogs)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(screen.getByText('Horizontal axis operation')).toBeInTheDocument();
    expect(screen.getByText('Horizontal axis field')).toBeInTheDocument();
    expect(screen.getByText('Vertical axis operation')).toBeInTheDocument();
    expect(screen.getByText('Break down by fields')).toBeInTheDocument();
    expect(screen.getByText('Break down by filters')).toBeInTheDocument();
  });

  it('should render line chart options', async () => {
    render('/aggregation?chart=line');

    expect(screen.getByText('klogs')).toBeInTheDocument();
    expect(screen.getByText('(hub / klogs)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(screen.getByText('Horizontal axis operation')).toBeInTheDocument();
    expect(screen.getByText('Vertical axis operation')).toBeInTheDocument();
    expect(screen.getByText('Break down by fields')).toBeInTheDocument();
    expect(screen.getByText('Break down by filters')).toBeInTheDocument();
  });

  it('should render area chart options', async () => {
    render('/aggregation?chart=area');

    expect(screen.getByText('klogs')).toBeInTheDocument();
    expect(screen.getByText('(hub / klogs)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(screen.getByText('Horizontal axis operation')).toBeInTheDocument();
    expect(screen.getByText('Vertical axis operation')).toBeInTheDocument();
    expect(screen.getByText('Break down by fields')).toBeInTheDocument();
    expect(screen.getByText('Break down by filters')).toBeInTheDocument();
  });
});
