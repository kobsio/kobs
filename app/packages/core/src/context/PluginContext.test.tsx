import { render as _render, RenderResult, screen, waitFor } from '@testing-library/react';
import { Fragment, FunctionComponent, ReactNode, useContext } from 'react';
import { vi } from 'vitest';

import { PluginContext, PluginContextProvider } from './PluginContext';

import Client from '../components/api/api';
import { APIContext } from '../components/api/context';
import QueryClientProvider from '../utils/QueryClientProvider';

describe('PluginContext', () => {
  const apiClient: Client = new Client();
  const getSpy = vi.spyOn(apiClient, 'get');

  const render = (children: ReactNode): RenderResult => {
    return _render(
      <QueryClientProvider>
        <APIContext.Provider value={{ api: apiClient }}>
          <PluginContextProvider plugins={[{ type: 'foo' }]}>{children}</PluginContextProvider>
        </APIContext.Provider>
      </QueryClientProvider>,
    );
  };

  const PluginConsumer: FunctionComponent = () => {
    const { instances } = useContext(PluginContext);
    return (
      <>
        {instances.map((instance, i) => (
          <Fragment key={i}>{instance.name}</Fragment>
        ))}
      </>
    );
  };

  it('should load plugin instances', async () => {
    getSpy.mockResolvedValueOnce([
      {
        cluster: 'dev',
        id: 'foo-1',
        name: 'foo instance 1',
        type: 'foo',
      },
    ]);

    render(<PluginConsumer />);

    await waitFor(() => expect(screen.getByText(/foo instance 1/)).toBeInTheDocument());
  });

  it('should render errors', async () => {
    vi.spyOn(console, 'error').mockImplementationOnce(() => {
      // noop (to supress the error log in test output)
    });
    getSpy.mockRejectedValueOnce(new Error('no bueno'));

    render(<PluginConsumer />);

    await waitFor(() => expect(screen.getByText(/no bueno/)).toBeInTheDocument());
  });

  it('helpers should work', async () => {
    getSpy.mockResolvedValueOnce([
      {
        cluster: 'dev',
        id: 'foo-1',
        name: 'foo instance 1',
        type: 'foo',
      },
    ]);

    const Test: FunctionComponent = () => {
      const { getInstance, getPlugin } = useContext(PluginContext);
      expect(getInstance('foo-1')).toBeDefined();
      expect(getPlugin('foo')).toBeDefined();
      return <>has been rendered</>;
    };

    render(<Test />);
    await waitFor(() => expect(screen.getByText(/has been rendered/)).toBeInTheDocument());
  });
});
