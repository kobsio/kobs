import React from 'react';

import { IPluginPanelProps, PluginPanel, PluginPanelError } from '@kobsio/shared';
import { IPanelOptions } from '../../utils/interfaces';

import GraphActions from './GraphActions';
import GraphWrapper from './GraphWrapper';

interface IKialiPluginPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

const Panel: React.FunctionComponent<IKialiPluginPanelProps> = ({
  title,
  description,
  options,
  instance,
  setDetails,
  times,
}: IKialiPluginPanelProps) => {
  if (options && options.namespaces && Array.isArray(options.namespaces) && times) {
    return (
      <PluginPanel
        title={title}
        description={description}
        actions={<GraphActions instance={instance} namespaces={options.namespaces} times={times} />}
      >
        <GraphWrapper instance={instance} namespaces={options.namespaces} times={times} setDetails={setDetails} />
      </PluginPanel>
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Options for Harbor panel are missing or invalid"
      details="The panel doesn't contain the required options to get data from the Harbor registry."
      documentation="https://kobs.io/main/plugins/harbor"
    />
  );
};

export default Panel;
