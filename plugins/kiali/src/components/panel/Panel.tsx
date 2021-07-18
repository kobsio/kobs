import React, { memo } from 'react';

import { IPluginPanelProps, PluginCard, PluginOptionsMissing } from '@kobsio/plugin-core';
import GraphActions from './GraphActions';
import GraphWrapper from './GraphWrapper';
import { IPanelOptions } from '../../utils/interfaces';

interface IPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

export const Panel: React.FunctionComponent<IPanelProps> = ({
  name,
  title,
  description,
  times,
  options,
  showDetails,
}: IPanelProps) => {
  if (!options || !options.namespaces || !Array.isArray(options.namespaces) || !times) {
    return (
      <PluginOptionsMissing
        title={title}
        message="Options for Kiali panel are missing or invalid"
        details="The panel doesn't contain the required options to render get the Kiali data or the provided options are invalid."
        documentation="https://kobs.io/plugins/kiali.html"
      />
    );
  }

  return (
    <PluginCard
      title={title}
      description={description}
      transparent={true}
      actions={
        <GraphActions
          name={name}
          namespaces={options.namespaces}
          duration={options.duration || times.timeEnd - times.timeStart}
        />
      }
    >
      <GraphWrapper
        name={name}
        namespaces={options.namespaces}
        duration={options.duration || times.timeEnd - times.timeStart}
        setDetails={showDetails}
      />
    </PluginCard>
  );
};

export default memo(Panel, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
