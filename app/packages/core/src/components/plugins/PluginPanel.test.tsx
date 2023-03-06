import { render as _render, RenderResult, screen } from '@testing-library/react';
import { FunctionComponent } from 'react';
import { vi } from 'vitest';

import PluginPanel from './PluginPanel';

import { IPluginContext, IPluginPanelProps, PluginContext } from '../../context/PluginContext';

describe('PluginPanel', () => {
  const render = (
    cluster: string,
    name: string,
    type: string,
    pluginContext: Partial<IPluginContext>,
  ): RenderResult => {
    vi.mock('../applications/ApplicationGroupsPanel', () => {
      return {
        default: () => {
          return <>mocked applicationgroups panel</>;
        },
      };
    });
    vi.mock('../applications/ApplicationsPanel', () => {
      return {
        default: () => {
          return <>mocked applications panel</>;
        },
      };
    });
    vi.mock('../applications/TopologyPanel', () => {
      return {
        default: () => {
          return <>mocked topology panel</>;
        },
      };
    });
    vi.mock('../dashboards/DashboardsPanel', () => {
      return {
        default: () => {
          return <>mocked dashboards panel</>;
        },
      };
    });
    vi.mock('../resources/ResourcesPanel', () => {
      return {
        default: () => {
          return <>mocked resources panel</>;
        },
      };
    });
    vi.mock('../teams/TeamsPanel', () => {
      return {
        default: () => {
          return <>mocked teams panel</>;
        },
      };
    });

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
        description: '',
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
        description: '',
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
        description: '',
        panel: TestPanel,
        type: 'bar',
      }),
    });

    expect(screen.getByText('An unexpected error occured while rendering the plugin')).toBeInTheDocument();
  });

  it('should handle core panels - applications', async () => {
    render('', 'applications', 'core', {});
    expect(screen.getByText('mocked applications panel')).toBeInTheDocument();
  });

  it('should handle core panels - applicationgroups', async () => {
    render('', 'applicationgroups', 'core', {});
    expect(screen.getByText('mocked applicationgroups panel')).toBeInTheDocument();
  });

  it('should handle core panels - topology', async () => {
    render('', 'topology', 'core', {});
    expect(screen.getByText('mocked topology panel')).toBeInTheDocument();
  });

  it('should handle core panels - teams', async () => {
    render('', 'teams', 'core', {});
    expect(screen.getByText('mocked teams panel')).toBeInTheDocument();
  });

  it('should handle core panels - dashboards', async () => {
    render('', 'dashboards', 'core', {});
    expect(screen.getByText('mocked dashboards panel')).toBeInTheDocument();
  });

  it('should handle core panels - resources', async () => {
    render('', 'resources', 'core', {});
    expect(screen.getByText('mocked resources panel')).toBeInTheDocument();
  });

  it('should handle error in core panels', async () => {
    render('', 'fake', 'core', {});
    expect(screen.getByText('Invalid plugin name')).toBeInTheDocument();
  });
});
