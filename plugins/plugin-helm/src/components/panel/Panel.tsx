import React from 'react';

import { IPluginPanelProps, PluginPanel, PluginPanelError } from '@kobsio/shared';
import History from './History';
import { IPanelOptions } from '../../utils/interfaces';
import PanelActions from './PanelActions';
import Releases from './Releases';

interface IHelmPluginPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

const Panel: React.FunctionComponent<IHelmPluginPanelProps> = ({
  title,
  description,
  options,
  instance,
  times,
  setDetails,
}: IHelmPluginPanelProps) => {
  if (options && options.clusters && options.namespaces && options.type === 'releases' && times) {
    return (
      <PluginPanel
        title={title}
        description={description}
        actions={<PanelActions instance={instance} options={options} />}
      >
        <Releases
          instance={instance}
          clusters={options.clusters}
          namespaces={options.namespaces}
          times={times}
          setDetails={setDetails}
        />
      </PluginPanel>
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
      <PluginPanel
        title={title}
        description={description}
        actions={<PanelActions instance={instance} options={options} />}
      >
        <History
          instance={instance}
          cluster={options.clusters[0]}
          namespace={options.namespaces[0]}
          release={options.name}
          setDetails={setDetails}
        />
      </PluginPanel>
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Options for Helm panel are missing or invalid"
      details="The panel doesn't contain the required options to show the Helm release data."
      documentation="https://kobs.io/main/plugins/helm"
    />
  );
};

export default Panel;
