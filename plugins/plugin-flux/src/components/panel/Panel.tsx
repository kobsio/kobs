import React from 'react';

import { IPanelOptions, TType } from '../../utils/interfaces';
import { IPluginPanelProps, PluginPanel, PluginPanelError } from '@kobsio/shared';
import PanelItem from './PanelItem';
import PanelList from './PanelList';
import { resources } from '../../utils/constants';

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
  if (
    options &&
    options.type &&
    options.cluster !== undefined &&
    options.namespace !== undefined &&
    options.type in resources
  ) {
    if (options.name) {
      return (
        <PluginPanel title={title} description={description}>
          <PanelItem
            instance={instance}
            type={options.type as TType}
            cluster={options.cluster}
            namespace={options.namespace}
            name={options.name}
            times={times}
          />
        </PluginPanel>
      );
    }

    return (
      <PluginPanel title={title} description={description}>
        <PanelList
          instance={instance}
          type={options.type as TType}
          cluster={options.cluster}
          namespace={options.namespace}
          selector={options.selector}
          times={times}
          setDetails={setDetails}
        />
      </PluginPanel>
    );
  }

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
