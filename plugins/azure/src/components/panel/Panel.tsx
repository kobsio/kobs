import React, { memo } from 'react';

import { IPluginPanelProps, PluginCard, PluginOptionsMissing } from '@kobsio/plugin-core';
import { IPanelOptions } from '../../utils/interfaces';
import { services } from '../../utils/services';

import CIContainerGroups from '../containerinstances/ContainerGroups';
import CIDetailsContainerGroup from '../containerinstances/DetailsContainerGroup';
import CIDetailsContainerGroupActions from '../containerinstances/DetailsContainerGroupActions';
import CIDetailsLogs from '../containerinstances/DetailsLogs';

import KSDetailsKubernetesService from '../kubernetesservices/DetailsKubernetesService';
import KSDetailsNodePools from '../kubernetesservices/DetailsNodePools';
import KSKubernetesServices from '../kubernetesservices/KubernetesServices';

import Metric from '../metrics/Metric';

const providerCI = services['containerinstances'].provider;
const providerKS = services['kubernetesservices'].provider;

interface IPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

export const Panel: React.FunctionComponent<IPanelProps> = ({
  name,
  title,
  description,
  times,
  options,
  showDetails,
}: IPanelProps) => {
  // Panels for container services.
  if (
    options?.type &&
    options?.type === 'containerinstances' &&
    options.containerinstances &&
    options.containerinstances.type === 'list' &&
    options.containerinstances.resourceGroups
  ) {
    return (
      <PluginCard title={title} description={description} transparent={true}>
        <CIContainerGroups
          name={name}
          resourceGroups={options.containerinstances.resourceGroups}
          setDetails={showDetails}
        />
      </PluginCard>
    );
  }

  if (
    options?.type &&
    options?.type === 'containerinstances' &&
    options.containerinstances &&
    options.containerinstances.type === 'details' &&
    options.containerinstances.resourceGroup &&
    options.containerinstances.containerGroup
  ) {
    return (
      <PluginCard
        title={title}
        description={description}
        actions={
          <CIDetailsContainerGroupActions
            name={name}
            resourceGroup={options.containerinstances.resourceGroup}
            containerGroup={options.containerinstances.containerGroup}
            isPanelAction={true}
          />
        }
      >
        <CIDetailsContainerGroup
          name={name}
          resourceGroup={options.containerinstances.resourceGroup}
          containerGroup={options.containerinstances.containerGroup}
        />
      </PluginCard>
    );
  }

  if (
    options?.type &&
    options?.type === 'containerinstances' &&
    options.containerinstances &&
    options.containerinstances.type === 'logs' &&
    options.containerinstances.resourceGroup &&
    options.containerinstances.containerGroup &&
    options.containerinstances.containers
  ) {
    return (
      <PluginCard title={title} description={description}>
        <CIDetailsLogs
          name={name}
          resourceGroup={options.containerinstances.resourceGroup}
          containerGroup={options.containerinstances.containerGroup}
          containers={options.containerinstances.containers}
        />
      </PluginCard>
    );
  }

  if (
    options?.type &&
    options?.type === 'containerinstances' &&
    options.containerinstances &&
    options.containerinstances.type === 'metrics' &&
    options.containerinstances.resourceGroup &&
    options.containerinstances.containerGroup &&
    options.containerinstances.metric &&
    times
  ) {
    return (
      <PluginCard title={title} description={description}>
        <Metric
          name={name}
          resourceGroup={options.containerinstances.resourceGroup}
          provider={providerCI + options.containerinstances.containerGroup}
          metricName={options.containerinstances.metric}
          times={times}
        />
      </PluginCard>
    );
  }

  // Panels for kubernetes services.
  if (
    options?.type &&
    options?.type === 'kubernetesservices' &&
    options.kubernetesservices &&
    options.kubernetesservices.type === 'list' &&
    options.kubernetesservices.resourceGroups
  ) {
    return (
      <PluginCard title={title} description={description} transparent={true}>
        <KSKubernetesServices
          name={name}
          resourceGroups={options.kubernetesservices.resourceGroups}
          setDetails={showDetails}
        />
      </PluginCard>
    );
  }

  if (
    options?.type &&
    options?.type === 'kubernetesservices' &&
    options.kubernetesservices &&
    options.kubernetesservices.type === 'details' &&
    options.kubernetesservices.resourceGroup &&
    options.kubernetesservices.managedCluster
  ) {
    return (
      <PluginCard title={title} description={description}>
        <KSDetailsKubernetesService
          name={name}
          resourceGroup={options.kubernetesservices.resourceGroup}
          managedCluster={options.kubernetesservices.managedCluster}
        />
      </PluginCard>
    );
  }

  if (
    options?.type &&
    options?.type === 'kubernetesservices' &&
    options.kubernetesservices &&
    options.kubernetesservices.type === 'nodePools' &&
    options.kubernetesservices.resourceGroup &&
    options.kubernetesservices.managedCluster
  ) {
    return (
      <PluginCard title={title} description={description}>
        <KSDetailsNodePools
          name={name}
          resourceGroup={options.kubernetesservices.resourceGroup}
          managedCluster={options.kubernetesservices.managedCluster}
        />
      </PluginCard>
    );
  }

  if (
    options?.type &&
    options?.type === 'kubernetesservices' &&
    options.kubernetesservices &&
    options.kubernetesservices.type === 'metrics' &&
    options.kubernetesservices.resourceGroup &&
    options.kubernetesservices.managedCluster &&
    options.kubernetesservices.metric &&
    times
  ) {
    return (
      <PluginCard title={title} description={description}>
        <Metric
          name={name}
          resourceGroup={options.kubernetesservices.resourceGroup}
          provider={providerKS + options.kubernetesservices.managedCluster}
          metricName={options.kubernetesservices.metric}
          times={times}
        />
      </PluginCard>
    );
  }

  return (
    <PluginOptionsMissing
      title={title}
      message="Options for Azure panel are missing or invalid"
      details="The panel doesn't contain the required options to render get the Azure data or the provided options are invalid."
      documentation="https://kobs.io/plugins/azure"
    />
  );
};

export default memo(Panel, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
