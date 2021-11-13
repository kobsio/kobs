import React, { memo } from 'react';

import { IPluginPanelProps, PluginCard, PluginOptionsMissing } from '@kobsio/plugin-core';
import Dashboards from './Dashboards';
import GrafanaPanel from './GrafanaPanel';
import { IPanelOptions } from '../../utils/interfaces';

interface IPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

export const Panel: React.FunctionComponent<IPanelProps> = ({
  name,
  title,
  description,
  times,
  pluginOptions,
  options,
}: IPanelProps) => {
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
        title={title}
        internalAddress={pluginOptions ? pluginOptions.internalAddress : ''}
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
      <PluginCard title={title} description={description} transparent={true}>
        <Dashboards
          name={name}
          dashboardIDs={options.dashboards}
          publicAddress={pluginOptions ? pluginOptions.publicAddress : ''}
        />
      </PluginCard>
    );
  }

  return (
    <PluginOptionsMissing
      title={title}
      message="Options for Grafana panel are missing or invalid"
      details="The panel doesn't contain the required options to render get the Grafana data or the provided options are invalid."
      documentation="https://kobs.io/plugins/grafana"
    />
  );
};

export default memo(Panel, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
