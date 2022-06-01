import React from 'react';

import { IPluginPanelProps, PluginPanel, PluginPanelError } from '@kobsio/shared';
import { IPanelOptions } from '../../utils/interfaces';
import Measures from './Measures';
import PanelActions from './PanelActions';

interface ISonarqubePluginPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

const Panel: React.FunctionComponent<ISonarqubePluginPanelProps> = ({
  title,
  description,
  options,
  instance,
  setDetails,
}: ISonarqubePluginPanelProps) => {
  if (options && options.project) {
    return (
      <PluginPanel
        title={title}
        description={description}
        actions={
          instance.options &&
          instance.options.address && <PanelActions address={instance.options.address} project={options.project} />
        }
      >
        <Measures instance={instance} project={options.project} metricKeys={options.metricKeys} />
      </PluginPanel>
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Options for SonarQube panel are missing or invalid"
      details="The panel doesn't contain the required options to get the SonarQube results."
      documentation="https://kobs.io/main/plugins/sonarqube"
    />
  );
};

export default Panel;
