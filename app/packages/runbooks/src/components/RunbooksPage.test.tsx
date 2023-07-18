import { QueryClientProvider, APIClient, APIContext } from '@kobsio/core';
import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import RunbooksPage from './RunbooksPage';

import { description } from '../utils/utils';

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

describe('RunbooksPage', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const render = (path: string): RenderResult => {
    const client = new APIClient();
    const getSpy = vi.spyOn(client, 'get');
    if (path === '/') {
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
    } else {
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
    }

    return _render(
      <MemoryRouter initialEntries={[path]}>
        <QueryClientProvider>
          <APIContext.Provider value={{ client: client, getUser: () => undefined }}>
            <RunbooksPage
              instance={{
                cluster: 'hub',
                id: '/cluster/hub/type/runbooks/name/runbooks',
                name: 'runbooks',
                type: 'runbooks',
              }}
            />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  it('should render runbooks', async () => {
    render('/');

    expect(screen.getByText('runbooks')).toBeInTheDocument();
    expect(screen.getByText('(hub / runbooks)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

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

  it('should render runbook', async () => {
    render('/group/testgroup1/alert/test1');

    expect(screen.getByText('runbooks')).toBeInTheDocument();
    expect(screen.getByText('(hub / runbooks)')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    expect(await waitFor(() => screen.getByText('test1'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('testgroup1'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('warning'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Message 1'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Comman Actions'))).toBeInTheDocument();
    expect(await waitFor(() => screen.getByText('Runbook 1'))).toBeInTheDocument();
  });
});
