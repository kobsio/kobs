import React from 'react';

import { IPluginPanelProps, PluginOptionsMissing } from '@kobsio/plugin-core';
import ApplicationsGallery from './ApplicationsGallery';
import ApplicationsTopology from './ApplicationsTopology';
import { IPanelOptions } from '../../utils/utils';
import icon from '../../assets/icon.png';

interface IPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

export const Panel: React.FunctionComponent<IPanelProps> = ({ name, title, options, showDetails }: IPanelProps) => {
  if (!options) {
    return (
      <PluginOptionsMissing
        title="Options for Application panel are missing"
        description=""
        documentation=""
        icon={icon}
      />
    );
  }

  if (options.view === 'topology') {
    return (
      <ApplicationsTopology
        clusters={options.clusters || []}
        namespaces={options.namespaces || []}
        showDetails={showDetails}
      />
    );
  }

  return (
    <ApplicationsGallery
      clusters={options.clusters || []}
      namespaces={options.namespaces || []}
      team={options.team}
      showDetails={showDetails}
    />
  );
};

export default Panel;
