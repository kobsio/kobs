import React, { memo } from 'react';

import { IPluginPanelProps, PluginCard, PluginOptionsMissing } from '@kobsio/plugin-core';
import { IPanelOptions } from '../../utils/interfaces';
import PanelList from './PanelList';

interface IPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

// Panel implements the panel component for the Flux plugin. The options property must be in the format of the
// IPanelOptions interface. Since the options are not validated on the API side, we have to validate the data, before
// we render the plugin.
export const Panel: React.FunctionComponent<IPanelProps> = ({
  name,
  title,
  description,
  options,
  setDetails,
}: IPanelProps) => {
  if (
    !options ||
    !options.cluster ||
    options.namespace === undefined ||
    !options.type ||
    (options.type !== 'gitrepositories.source.toolkit.fluxcd.io/v1beta1' &&
      options.type !== 'helmrepositories.source.toolkit.fluxcd.io/v1beta1' &&
      options.type !== 'buckets.source.toolkit.fluxcd.io/v1beta1' &&
      options.type !== 'kustomizations.kustomize.toolkit.fluxcd.io/v1beta1' &&
      options.type !== 'helmreleases.helm.toolkit.fluxcd.io/v2beta1')
  ) {
    return (
      <PluginOptionsMissing
        title={title}
        message="Options for Flux panel are missing or invalid"
        details="The panel doesn't contain the required options to get resources for Flux or the provided options are invalid."
        documentation="https://kobs.io/plugins/flux"
      />
    );
  }

  return (
    <PluginCard title={title} description={description}>
      <PanelList
        name={name}
        title={title}
        type={options.type}
        cluster={options.cluster}
        namespace={options.namespace}
        selector={options.selector}
        setDetails={setDetails}
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
