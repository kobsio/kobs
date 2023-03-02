import { Alert, AlertTitle } from '@mui/material';
import { FunctionComponent, useContext } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { PluginContext } from '../../context/PluginContext';
import { ITimes } from '../../utils/times';
import ApplicationGroupsPanel from '../applications/ApplicationGroupsPanel';
import ApplicationsPanel from '../applications/ApplicationsPanel';
import TopologyPanel from '../applications/TopologyPanel';
import DashboardsPanel from '../dashboards/DashboardsPanel';
import TeamsPanel from '../teams/TeamsPanel';
import { PluginPanel as PluginPanelInternal, PluginPanelError } from '../utils/PluginPanel';

interface ICorePanelProps {
  cluster: string;
  description?: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
  times: ITimes;
  title: string;
}

/**
 * The `CorePanel` component renders the panels in a dashboard where the provided plugin type is `core`. These panels
 * do not require any other plugin from other packages so that we handle them outside of the actual plugin logic.
 *
 * The following panels can be used within the `core` type:
 * - `applications`: Render a list of applications for a provided team or for the authenticated user
 * - `applicationgroups`: Render a list of application groups for a provided team or for the authenticated user
 * - `topology`: Render a topology graph for the provided application
 * - `inisghts`: Render the insights of an application
 * - `teams`: Render a list of teams for the currently authenticated user
 * - `dashboards`: Render a list of links to dashboard pages
 * - `resources`: Render a list of Kubernetes resources
 */
const CorePanel: React.FunctionComponent<ICorePanelProps> = ({
  cluster,
  name,
  title,
  description,
  options,
  times,
}: ICorePanelProps) => {
  if (name === 'applications') {
    return <ApplicationsPanel title={title} description={description} options={options} />;
  }

  if (name === 'applicationgroups') {
    return <ApplicationGroupsPanel title={title} description={description} options={options} />;
  }

  if (name === 'topology') {
    return <TopologyPanel title={title} description={description} options={options} />;
  }

  if (name === 'insights') {
  }

  if (name === 'teams') {
    return <TeamsPanel title={title} description={description} />;
  }

  if (name === 'dashboards') {
    return <DashboardsPanel title={title} description={description} options={options} />;
  }

  if (name === 'resources') {
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Invalid plugin name"
      details={`The plugin name ${name} is invalid for the plugin type core.`}
      documentation="https://kobs.io/main/plugins/#built-in-plugins"
    />
  );
};

interface IPluginPanelProps {
  cluster: string;
  description?: string;
  name: string;
  options?: unknown;
  times: ITimes;
  title: string;
  type: string;
}

/**
 * The `PluginPanel` component is responsible for rendering a plugin panel in a dashboard. To identify the plugin which
 * should be rendered the `cluster`, `name` and `type` props are required. Each panel also requires a `title`. The
 * `description`, `options`, and `times` props are optionally.
 */
const PluginPanel: FunctionComponent<IPluginPanelProps> = ({
  cluster,
  name,
  type,
  title,
  description,
  options,
  times,
}) => {
  const { getInstance, getPlugin } = useContext(PluginContext);

  if (type === 'core') {
    return (
      <CorePanel
        cluster={cluster}
        name={name}
        title={title}
        description={description}
        options={options}
        times={times}
      />
    );
  }

  const instance = name ? getInstance(`/cluster/${cluster}/type/${type}/name/${name}`) : undefined;
  const Panel = instance ? getPlugin(instance.type)?.panel : undefined;

  return (
    <ErrorBoundary
      fallbackRender={({ error }): React.ReactElement => (
        <PluginPanelInternal title={title} description={description}>
          <Alert severity="error">
            <AlertTitle>An unexpected error occured while rendering the plugin</AlertTitle>
            {error.message}
          </Alert>
        </PluginPanelInternal>
      )}
    >
      {Panel && instance ? (
        <Panel instance={instance} title={title} description={description} options={options} times={times} />
      ) : (
        <PluginPanelInternal title={title} description={description}>
          <Alert severity="info">
            The plugin{' '}
            <b>
              {name} ({type} / {cluster})
            </b>{' '}
            does not implement the panel interface
          </Alert>
        </PluginPanelInternal>
      )}
    </ErrorBoundary>
  );
};

export default PluginPanel;
