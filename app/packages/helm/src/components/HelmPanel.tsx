import { IPluginPanelProps, pluginBasePath, PluginPanel, PluginPanelActionLinks, PluginPanelError } from '@kobsio/core';
import { FunctionComponent } from 'react';

import History from './History';
import Releases from './Releases';

import { example } from '../utils/utils';

/**
 * `IOptions` is the interface for the options which can be set by a user for the Helm panel in a dashboard.
 */
interface IOptions {
  clusters?: string[];
  name?: string;
  namespaces?: string[];
  type?: string;
}

/**
 * The `HelmPanel` component implements the panel interface for the Helm plugin, so that a user can use the Helm plugin
 * within a dashboard. The panel can be used to show a list of Helm releases or the history of a specific Helm release
 * within a dashboard.
 */
const HelmPanel: FunctionComponent<IPluginPanelProps<IOptions>> = ({
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
    options.type === 'releases' &&
    times
  ) {
    const join = (v: string[] | undefined): string => (v && v.length > 0 ? v.join('') : '');
    const c = join(options.clusters?.map((cluster) => `&clusters[]=${encodeURIComponent(cluster)}`));
    const n = join(options.namespaces?.map((namespace) => `&namespaces[]=${encodeURIComponent(namespace)}`));

    return (
      <PluginPanel
        title={title}
        description={description}
        actions={
          <PluginPanelActionLinks links={[{ link: `${pluginBasePath(instance)}?${c}${n}`, title: 'Explore' }]} />
        }
      >
        <Releases instance={instance} clusters={options.clusters} namespaces={options.namespaces ?? []} times={times} />
      </PluginPanel>
    );
  }

  if (
    options &&
    options.clusters &&
    Array.isArray(options.clusters) &&
    options.clusters.length === 1 &&
    options.namespaces &&
    Array.isArray(options.namespaces) &&
    options.namespaces.length === 1 &&
    options.name &&
    options.type === 'releasehistory' &&
    times
  ) {
    return (
      <PluginPanel
        title={title}
        description={description}
        actions={
          <PluginPanelActionLinks
            links={[
              {
                link: `${pluginBasePath(instance)}?&clusters[]=${encodeURIComponent(
                  options.clusters[0],
                )}&namespaces[]=${encodeURIComponent(options.namespaces[0])}`,
                title: 'Explore',
              },
            ]}
          />
        }
      >
        <History
          instance={instance}
          cluster={options.clusters[0]}
          namespace={options.namespaces[0]}
          name={options.name}
          times={times}
        />
      </PluginPanel>
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Invalid options for Helm plugin"
      details="One of the required options is missing."
      example={example}
      documentation="https://kobs.io/main/plugins/helm"
    />
  );
};

export default HelmPanel;
