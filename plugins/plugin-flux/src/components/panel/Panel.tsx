import React from 'react';

import { IPluginPanelProps, PluginPanelError } from '@kobsio/shared';
import { IPanelOptions } from '../../utils/interfaces';

interface IFluxPluginPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

const Panel: React.FunctionComponent<IFluxPluginPanelProps> = ({
  title,
  description,
  options,
  instance,
  times,
  setDetails,
}: IFluxPluginPanelProps) => {
  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Options for Flux panel are missing or invalid"
      details="The panel doesn't contain the required options to show Flux resources."
      documentation="https://kobs.io/main/plugins/flux"
    />
  );
};

export default Panel;
