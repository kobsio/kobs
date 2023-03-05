import { FunctionComponent } from 'react';

import Resources from './Resources';
import { IOptions } from './utils';

import { ITimes } from '../../utils/times';
import { PluginPanel, PluginPanelError } from '../utils/PluginPanel';

interface IResourcesPanelProps {
  description?: string;
  options?: IOptions;
  times: ITimes;
  title: string;
}

const ResourcesPanel: FunctionComponent<IResourcesPanelProps> = ({ title, description, options, times }) => {
  if (
    !options ||
    !options.clusters ||
    !Array.isArray(options.clusters) ||
    options.clusters.length === 0 ||
    !options.namespaces ||
    !Array.isArray(options.namespaces) ||
    options.namespaces.length === 0 ||
    !options.resources ||
    !Array.isArray(options.resources) ||
    options.resources.length === 0
  ) {
    return (
      <PluginPanelError
        title={title}
        description={description}
        message="Invalid options for resources plugin"
        details="The options for the resources plugin are invalid, you have to provide at least one cluster, namespace and resource"
        example={`plugin:
  name: resources
  type: core
  options:
    clusters:
      - kobs
    namespaces:
      - default
    resources:
      - pods
      - deployments
    paramName: labelSelector
    param: app=kobs`}
        documentation="https://kobs.io/main/plugins/#resources"
      />
    );
  }

  return (
    <PluginPanel title={title} description={description}>
      <Resources options={options} times={times} />
    </PluginPanel>
  );
};

export default ResourcesPanel;
