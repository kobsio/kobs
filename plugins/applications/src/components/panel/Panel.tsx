import React from 'react';

import { IPluginPanelProps, PluginCard, PluginOptionsMissing } from '@kobsio/plugin-core';
import ApplicationsGallery from './ApplicationsGallery';
import ApplicationsTopology from './ApplicationsTopology';
import { IPanelOptions } from '../../utils/utils';

interface IPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

export const Panel: React.FunctionComponent<IPanelProps> = ({
  defaults,
  name,
  title,
  options,
  showDetails,
}: IPanelProps) => {
  if (!options) {
    return (
      <PluginOptionsMissing
        title={title}
        message="Options for Application panel are missing"
        details=""
        documentation=""
      />
    );
  }

  if (options.view === 'topology') {
    const topology = (
      <ApplicationsTopology
        clusters={options.clusters || [defaults.cluster]}
        namespaces={options.namespaces || [defaults.namespace]}
        showDetails={showDetails}
      />
    );

    if (title) {
      return <PluginCard title={title}>{topology}</PluginCard>;
    }

    return topology;
  }

  const gallery = (
    <ApplicationsGallery
      clusters={options.clusters || [defaults.cluster]}
      namespaces={options.namespaces || [defaults.namespace]}
      team={options.team}
      showDetails={showDetails}
    />
  );

  if (title) {
    return <PluginCard title={title}>{gallery}</PluginCard>;
  }

  return gallery;
};

export default Panel;
