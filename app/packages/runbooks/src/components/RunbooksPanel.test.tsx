import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import RunbooksPanel from './RunbooksPanel';

vi.mock('@kobsio/core', async () => {
  const originalModule = await vi.importActual('@kobsio/core');
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(originalModule as any),
    Editor: () => {
      return <>mocked editor</>;
    },
  };
});

describe('RunbooksPanel', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (options: any): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');

    if (options?.type === 'list') {
      getSpy.mockResolvedValue([
        {
          alert: 'test1',
          common: 'Comman Actions',
          expr: 'vector(1)',
          group: 'testgroup1',
          id: '/group/test/alert/test1',
          message: 'Message 1',
          runbook: 'Runbook 1',
          severity: 'warning',
        },
        {
          alert: 'test2',
          common: 'Comman Actions',
          expr: 'vector(2)',
          group: 'testgroup2',
          id: '/group/test/alert/test2',
          message: 'Message 2',
          runbook: 'Runbook 2',
          severity: 'info',
        },
      ]);
    } else if (options?.type === 'details') {
      getSpy.mockResolvedValue([
        {
          alert: 'test1',
          common: 'Comman Actions',
          expr: 'vector(1)',
          group: 'testgroup1',
          id: '/group/test/alert/test1',
          message: 'Message 1',
          runbook: 'Runbook 1',
          severity: 'warning',
        },
      ]);
    } else {
      getSpy.mockResolvedValue([]);
    }

    return _render(
      <MemoryRouter>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <RunbooksPanel
              title="Test"
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/runbooks/name/runbooks',
                name: 'runbooks',
                type: 'runbooks',
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
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render error on missing options', async () => {
    render(undefined);
    expect(await waitFor(() => screen.getByText('Invalid options for Runbooks plugin'))).toBeInTheDocument();
  });

  it('should render list of runbooks', async () => {
    render({ query: 'test', type: 'list' });

    expect(await waitFor(() => screen.getByText('test1'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('testgroup1'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('warning'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Message 1'))).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('test2'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('testgroup2'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('info'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Message 2'))).toBeInTheDocument();

    await userEvent.click(screen.getByText(/test1/));
    expect(await waitFor(() => screen.getByText('Comman Actions'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Runbook 1'))).toBeInTheDocument();
  });

  it('should render single runbook', async () => {
    render({ alert: 'test1', group: 'testgroup1', type: 'details' });

    expect(await waitFor(() => screen.getByText('test1'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('testgroup1'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('warning'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Message 1'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Comman Actions'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Runbook 1'))).toBeInTheDocument();
  });
});
