import React, { memo } from 'react';

import { IPluginPanelProps, PluginCard, PluginOptionsMissing } from '@kobsio/plugin-core';
import History from './History';
import { IPanelOptions } from '../../utils/interfaces';
import Releases from './Releases';

interface IPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

export const Panel: React.FunctionComponent<IPanelProps> = ({
  name,
  title,
  description,
  options,
  times,
  setDetails,
}: IPanelProps) => {
  if (options && options.clusters && options.namespaces && options.type === 'releases' && times) {
    return (
      <PluginCard title={title} description={description}>
        <Releases
          name={name}
          clusters={options.clusters}
          namespaces={options.namespaces}
          times={times}
          setDetails={setDetails}
        />
      </PluginCard>
    );
  }

  if (
    options &&
    options.clusters &&
    options.namespaces &&
    options.name &&
    options.clusters.length === 1 &&
    options.namespaces.length === 1 &&
    options.type === 'releasehistory' &&
    times
  ) {
    return (
      <PluginCard title={title} description={description}>
        <History
          name={name}
          cluster={options.clusters[0]}
          namespace={options.namespaces[0]}
          release={options.name}
          setDetails={setDetails}
        />
      </PluginCard>
    );
  }

  return (
    <PluginOptionsMissing
      title={title}
      message="Options for Helm panel are missing or invalid"
      details="The panel doesn't contain the required options to get Helm releases or the provided options are invalid."
      documentation="https://kobs.io/plugins/helm"
    />
  );
};

export default memo(Panel, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
