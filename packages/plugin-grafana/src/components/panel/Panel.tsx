import React from 'react';

import { IPluginPanelProps, PluginPanel, PluginPanelError } from '@kobsio/shared';
import Dashboards from './Dashboards';
import GrafanaPanel from './GrafanaPanel';
import { IPanelOptions } from '../../utils/interfaces';

interface IGrafanaPluginPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

const Panel: React.FunctionComponent<IGrafanaPluginPanelProps> = ({
  title,
  description,
  options,
  instance,
  setDetails,
  times,
}: IGrafanaPluginPanelProps) => {
  if (
    options &&
    options.type === 'panel' &&
    options.panel &&
    options.panel.dashboardID &&
    options.panel.panelID &&
    times
  ) {
    return (
      <GrafanaPanel
        instance={instance}
        title={title}
        dashboardID={options.panel.dashboardID}
        panelID={options.panel.panelID}
        variables={options.panel.variables}
        times={times}
      />
    );
  }

  if (
    options &&
    options.type === 'dashboards' &&
    options.dashboards &&
    Array.isArray(options.dashboards) &&
    options.dashboards.length > 0
  ) {
    return (
      <PluginPanel title={title} description={description}>
        <Dashboards instance={instance} dashboardIDs={options.dashboards} />
      </PluginPanel>
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Options for Grafana panel are missing or invalid"
      details="The panel doesn't contain the required options to get data from Grafana."
      documentation="https://kobs.io/main/plugins/grafana"
    />
  );
};

export default Panel;
