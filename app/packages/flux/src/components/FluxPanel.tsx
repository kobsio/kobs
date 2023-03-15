import { IPluginPanelProps, PluginPanelError } from '@kobsio/core';
import { FunctionComponent } from 'react';

import Resources from './Resources';

/**
 * `IOptions` is the interface for the options which can be set by a user within the Flux plugin when it is used within
 * a panel.
 */
interface IOptions {
  clusters?: string[];
  namespaces?: string[];
  param?: string;
  paramName?: string;
  type?: string;
}

/**
 * The `FluxPanel` is the panel component for the Flux plugin, so that the plugin can be used within a dashboard.
 */
const FluxPanel: FunctionComponent<IPluginPanelProps<IOptions>> = ({
  title,
  description,
  options,
  instance,
  times,
}) => {
  if (
    options &&
    options.clusters &&
    Array.isArray(options.clusters) &&
    options.clusters.length > 0 &&
    (options.type === 'gitrepositories' ||
      options.type === 'helmrepositories' ||
      options.type === 'buckets' ||
      options.type === 'kustomizations' ||
      options.type === 'helmreleases')
  ) {
    return (
      <Resources
        instance={instance}
        clusters={options.clusters}
        namespaces={options.namespaces ?? []}
        resource={options.type}
        paramName={options.paramName ?? ''}
        param={options.param ?? ''}
        times={times}
      />
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Invalid options for Flux plugin"
      details="One of the required options is missing."
      example={`plugin:
  name: flux
  type: flux
  options:
    # Type must be gitrepositories, helmrepositories, buckets, kustomizations or helmreleases
    type: kustomizations
    clusters:
      - mycluster`}
      documentation="https://kobs.io/main/plugins/flux"
    />
  );
};

export default FluxPanel;
