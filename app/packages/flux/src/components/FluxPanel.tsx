import { IPluginPanelProps, pluginBasePath, PluginPanel, PluginPanelActionLinks, PluginPanelError } from '@kobsio/core';
import { FunctionComponent } from 'react';

import Resources from './Resources';

import { example } from '../utils/utils';

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
    const join = (v: string[] | undefined): string => (v && v.length > 0 ? v.join('') : '');
    const c = join(options.clusters?.map((cluster) => `&clusters[]=${encodeURIComponent(cluster)}`));
    const n = join(options.namespaces?.map((namespace) => `&namespaces[]=${encodeURIComponent(namespace)}`));

    return (
      <PluginPanel
        title={title}
        description={description}
        actions={
          <PluginPanelActionLinks
            links={[{ link: `${pluginBasePath(instance)}?&type=${options.type}${c}${n}`, title: 'Explore' }]}
          />
        }
      >
        <Resources
          instance={instance}
          clusters={options.clusters}
          namespaces={options.namespaces ?? []}
          resource={options.type}
          paramName={options.paramName ?? ''}
          param={options.param ?? ''}
          times={times}
        />
      </PluginPanel>
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Invalid options for Flux plugin"
      details="One of the required options is missing."
      example={example}
      documentation="https://kobs.io/main/plugins/flux"
    />
  );
};

export default FluxPanel;
