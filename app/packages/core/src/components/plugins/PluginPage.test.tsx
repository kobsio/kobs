import { render as _render, RenderResult, screen } from '@testing-library/react';
import { FunctionComponent } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import PluginPage from './PluginPage';

import { IPluginContext, IPluginInstance, PluginContext } from '../../context/PluginContext';

describe('PluginPage', () => {
  const render = (path: string, pluginContext: Partial<IPluginContext>): RenderResult => {
    const defaultPluginContext = {
      getClusters: () => [],
      getInstance: (id: string) => undefined,
      getPlugin: (type: string) => undefined,
      getPluginTypes: () => [],
      instances: [],
    };

    return _render(
      <MemoryRouter initialEntries={[path]}>
        <PluginContext.Provider value={{ ...defaultPluginContext, ...pluginContext }}>
          <Routes>
            <Route path="/plugins/:cluster/:type/:name" element={<PluginPage />} />
          </Routes>
        </PluginContext.Provider>
      </MemoryRouter>,
    );
  };

  it('should render the plugin page with the given instance props', async () => {
    const TestPage: FunctionComponent<{ instance: IPluginInstance }> = ({ instance: { cluster, id, name, type } }) => {
      return (
        <>
          my plugin with props cluster={cluster} id={id} name={name} type={type}
        </>
      );
    };

    const instance = {
      cluster: 'dev',
      id: '/cluster/dev/bar/bar-instance',
      name: 'bar-instance',
      type: 'bar',
    };

    render('/plugins/dev/bar/bar-instance', {
      getInstance: () => instance,
      getPlugin: () => ({
        page: TestPage,
        type: 'bar',
      }),
    });

    expect(
      screen.getByText(
        `my plugin with props cluster=${instance.cluster} id=${instance.id} name=${instance.name} type=${instance.type}`,
      ),
    ).toBeInTheDocument();
  });

  it('should render an alert when page interface is not implemented', async () => {
    const instance = {
      cluster: 'dev',
      id: '/cluster/dev/bar/bar-instance',
      name: 'bar-instance',
      type: 'bar',
    };

    render('/plugins/dev/bar/bar-instance', {
      getInstance: () => instance,
      getPlugin: () => ({
        page: undefined,
        type: 'bar',
      }),
    });

    expect(screen.getByText(`bar-instance (bar / dev)`)).toBeInTheDocument();
  });

  it('should handle errors from plugin', async () => {
    const TestPage: FunctionComponent<{ instance: IPluginInstance }> = ({ instance: { cluster, id, name, type } }) => {
      const test: string[] | undefined = undefined;

      return (
        <>
          {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
          {test!.map((e) => (
            <div key={e}>{e}</div>
          ))}
        </>
      );
    };

    const instance = {
      cluster: 'dev',
      id: '/cluster/dev/bar/bar-instance',
      name: 'bar-instance',
      type: 'bar',
    };

    render('/plugins/dev/bar/bar-instance', {
      getInstance: () => instance,
      getPlugin: () => ({
        page: TestPage,
        type: 'bar',
      }),
    });

    expect(screen.getByText('An unexpected error occured while rendering the plugin')).toBeInTheDocument();
  });
});
