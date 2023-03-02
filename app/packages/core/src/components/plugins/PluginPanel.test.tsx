import { render as _render, RenderResult, screen } from '@testing-library/react';
import { FunctionComponent } from 'react';

import PluginPanel from './PluginPanel';

import { IPluginContext, IPluginPanelProps, PluginContext } from '../../context/PluginContext';

describe('PluginPanel', () => {
  const render = (
    cluster: string,
    name: string,
    type: string,
    pluginContext: Partial<IPluginContext>,
  ): RenderResult => {
    const defaultPluginContext = {
      getClusters: () => [],
      getInstance: (id: string) => undefined,
      getPlugin: (type: string) => undefined,
      getPluginTypes: () => [],
      instances: [],
    };

    return _render(
      <PluginContext.Provider value={{ ...defaultPluginContext, ...pluginContext }}>
        <PluginPanel
          cluster={cluster}
          name={name}
          type={type}
          title=""
          times={{
            time: 'last15Minutes',
            timeEnd: Math.floor(Date.now() / 1000),
            timeStart: Math.floor(Date.now() / 1000) - 900,
          }}
        />
      </PluginContext.Provider>,
    );
  };

  it('should render the plugin panel with the given instance props', async () => {
    const TestPanel: FunctionComponent<IPluginPanelProps> = ({ instance, title }) => {
      return (
        <>
          my plugin with props cluster={instance.cluster} id={instance.id} name={instance.name} type={instance.type}
        </>
      );
    };

    const instance = {
      cluster: 'dev',
      id: '/cluster/dev/bar/bar-instance',
      name: 'bar-instance',
      type: 'bar',
    };

    render('dev', 'bar-instance', 'bar', {
      getInstance: () => instance,
      getPlugin: () => ({
        panel: TestPanel,
        type: 'bar',
      }),
    });

    expect(
      screen.getByText(
        `my plugin with props cluster=${instance.cluster} id=${instance.id} name=${instance.name} type=${instance.type}`,
      ),
    ).toBeInTheDocument();
  });

  it('should render an alert when panel interface is not implemented', async () => {
    const instance = {
      cluster: 'dev',
      id: '/cluster/dev/bar/bar-instance',
      name: 'bar-instance',
      type: 'bar',
    };

    render('dev', 'bar-instance', 'bar', {
      getInstance: () => instance,
      getPlugin: () => ({
        panel: undefined,
        type: 'bar',
      }),
    });

    expect(screen.getByText(`bar-instance (bar / dev)`)).toBeInTheDocument();
  });

  it('should handle errors from plugin', async () => {
    const TestPanel: FunctionComponent<IPluginPanelProps> = ({ instance, title }) => {
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

    render('dev', 'bar-instance', 'bar', {
      getInstance: () => instance,
      getPlugin: () => ({
        panel: TestPanel,
        type: 'bar',
      }),
    });

    expect(screen.getByText('An unexpected error occured while rendering the plugin')).toBeInTheDocument();
  });
});
