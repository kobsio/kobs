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
  defaults,
  title,
  description,
  options,
  times,
  setDetails,
}: IPanelProps) => {
  if (options && options.type === 'releases' && times) {
    return (
      <PluginCard title={title} description={description}>
        <Releases
          name={name}
          clusters={options.clusters ? options.clusters : [defaults.cluster]}
          namespaces={options.namespaces ? options.namespaces : [defaults.namespace]}
          times={times}
          setDetails={setDetails}
        />
      </PluginCard>
    );
  }

  if (options && options.type === 'releasehistory' && options.name && times) {
    return (
      <PluginCard title={title} description={description}>
        <History
          name={name}
          cluster={options.clusters && options.clusters.length === 1 ? options.clusters[0] : defaults.cluster}
          namespace={options.namespaces && options.namespaces.length === 1 ? options.namespaces[0] : defaults.namespace}
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
