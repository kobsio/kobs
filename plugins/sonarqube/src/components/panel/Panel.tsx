import React, { memo } from 'react';

import { IPluginPanelProps, PluginCard, PluginOptionsMissing } from '@kobsio/plugin-core';
import { IPanelOptions } from '../../utils/interfaces';
import Measures from './Measures';
import PanelActions from './PanelActions';

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
  if (!options || !times || !options.project) {
    return (
      <PluginOptionsMissing
        title={title}
        message="Options for SonarQube panel are missing or invalid"
        details="The panel doesn't contain the required options to render get the SonarQube data or the provided options are invalid."
        documentation="https://kobs.io/plugins/sonarqube"
      />
    );
  }

  return (
    <PluginCard
      title={title}
      description={description}
      transparent={true}
      actions={<PanelActions url={pluginOptions ? pluginOptions.url : ''} project={options.project} />}
    >
      <Measures name={name} project={options.project} metricKeys={options.metricKeys} />
    </PluginCard>
  );
};

export default memo(Panel, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
