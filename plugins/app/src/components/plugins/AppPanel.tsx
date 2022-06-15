import { Alert, AlertVariant } from '@patternfly/react-core';
import React from 'react';

import { ITimes, PluginPanel } from '@kobsio/shared';
import ApplicationsPanel from '../applications/ApplicationsPanel';
import DashboardsPanel from '../dashboards/DashboardsPanel';
import Markdown from '../markdown/Markdown';
import ResourcesPanelWrapper from '../resources/ResourcesPanelWrapper';
import UserApplications from '../profile/UserApplications';
import UserTeams from '../profile/UserTeams';

interface IAppPanelProps {
  title: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
  satellite: string;
  name: string;
  times?: ITimes;
  setDetails?: (details: React.ReactNode) => void;
}

const AppPanel: React.FunctionComponent<IAppPanelProps> = ({
  title,
  description,
  satellite,
  name,
  options,
  times,
  setDetails,
}: IAppPanelProps) => {
  if (name === 'applications') {
    return <ApplicationsPanel title={title} description={description} options={options} setDetails={setDetails} />;
  }

  if (name === 'userapplications') {
    return <UserApplications title={title} description={description} setDetails={setDetails} />;
  }

  if (name === 'userteams') {
    return (
      <PluginPanel title={title} description={description}>
        <UserTeams setDetails={setDetails} />
      </PluginPanel>
    );
  }

  if (name === 'dashboards') {
    return (
      <PluginPanel title={title} description={description}>
        <DashboardsPanel options={options} />
      </PluginPanel>
    );
  }

  if (name === 'markdown') {
    return (
      <PluginPanel title={title} description={description}>
        <Markdown options={options} />
      </PluginPanel>
    );
  }

  if (name === 'resources') {
    return (
      <PluginPanel title={title} description={description}>
        <ResourcesPanelWrapper options={options} times={times} setDetails={setDetails} />
      </PluginPanel>
    );
  }

  return (
    <PluginPanel title={title} description={description}>
      <Alert isInline={true} variant={AlertVariant.danger} title="Invalid plugin name">
        The plugin name <b>{name}</b> is invalid for the plugin type <b>app</b>.
      </Alert>
    </PluginPanel>
  );
};

export default AppPanel;
