import React from 'react';

import { IPluginPanelProps, PluginPanel, PluginPanelError } from '@kobsio/shared';
import { IPanelOptions } from '../../utils/interfaces';
import { services } from '../../utils/services';

import CIContainerGroups from '../containerinstances/ContainerGroups';
import CIDetailsContainerGroup from '../containerinstances/DetailsContainerGroup';
import CIDetailsContainerGroupActions from '../containerinstances/DetailsContainerGroupActions';
import CIDetailsLogs from '../containerinstances/DetailsLogs';

import CMActualCosts from '../costmanagement/ActualCosts';

import KSDetailsKubernetesService from '../kubernetesservices/DetailsKubernetesService';
import KSDetailsNodePoolsWrapper from '../kubernetesservices/DetailsNodePoolsWrapper';
import KSKubernetesServices from '../kubernetesservices/KubernetesServices';

import VMSSDetailsVirtualMachineScaleSets from '../virtualmachinescalesets/DetailsVirtualMachineScaleSets';
import VMSSDetailsVirtualMachines from '../virtualmachinescalesets/DetailsVirtualMachines';
import VMSSVirtualMachineScaleSets from '../virtualmachinescalesets/VirtualMachineScaleSets';

import Metric from '../metrics/Metric';

const providerCI = services['containerinstances'].provider;
const providerKS = services['kubernetesservices'].provider;
const providerVMSS = services['virtualmachinescalesets'].provider;

interface IAzurePluginPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

const Panel: React.FunctionComponent<IAzurePluginPanelProps> = ({
  title,
  description,
  options,
  instance,
  times,
  setDetails,
}: IAzurePluginPanelProps) => {
  // Panels for container services.
  if (
    options?.type &&
    options?.type === 'containerinstances' &&
    options.containerinstances &&
    options.containerinstances.type === 'list' &&
    options.containerinstances.resourceGroups
  ) {
    return (
      <PluginPanel title={title} description={description}>
        <CIContainerGroups
          instance={instance}
          resourceGroups={options.containerinstances.resourceGroups}
          setDetails={setDetails}
        />
      </PluginPanel>
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
      <PluginPanel
        title={title}
        description={description}
        actions={
          <CIDetailsContainerGroupActions
            instance={instance}
            resourceGroup={options.containerinstances.resourceGroup}
            containerGroup={options.containerinstances.containerGroup}
            isPanelAction={true}
          />
        }
      >
        <CIDetailsContainerGroup
          instance={instance}
          resourceGroup={options.containerinstances.resourceGroup}
          containerGroup={options.containerinstances.containerGroup}
        />
      </PluginPanel>
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
      <PluginPanel title={title} description={description}>
        <CIDetailsLogs
          instance={instance}
          resourceGroup={options.containerinstances.resourceGroup}
          containerGroup={options.containerinstances.containerGroup}
          containers={options.containerinstances.containers}
          tail={options.containerinstances.tail || 10000}
          timestamps={options.containerinstances.timestamps || false}
        />
      </PluginPanel>
    );
  }

  if (
    options?.type &&
    options?.type === 'containerinstances' &&
    options.containerinstances &&
    options.containerinstances.type === 'metrics' &&
    options.containerinstances.resourceGroup &&
    options.containerinstances.containerGroup &&
    options.containerinstances.metricNames &&
    options.containerinstances.aggregationType &&
    times
  ) {
    return (
      <PluginPanel title={title} description={description}>
        <Metric
          instance={instance}
          resourceGroup={options.containerinstances.resourceGroup}
          provider={providerCI + options.containerinstances.containerGroup}
          metricNames={options.containerinstances.metricNames}
          aggregationType={options.containerinstances.aggregationType}
          times={times}
        />
      </PluginPanel>
    );
  }

  if (
    options?.type &&
    options?.type === 'costmanagement' &&
    options.costmanagement &&
    options.costmanagement.type === 'actualcosts' &&
    times
  ) {
    return (
      <PluginPanel title={title} description={description}>
        <CMActualCosts instance={instance} scope={options.costmanagement.scope || 'All'} times={times} />
      </PluginPanel>
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
      <PluginPanel title={title} description={description}>
        <KSKubernetesServices
          instance={instance}
          resourceGroups={options.kubernetesservices.resourceGroups}
          setDetails={setDetails}
        />
      </PluginPanel>
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
      <PluginPanel title={title} description={description}>
        <KSDetailsKubernetesService
          instance={instance}
          resourceGroup={options.kubernetesservices.resourceGroup}
          managedCluster={options.kubernetesservices.managedCluster}
        />
      </PluginPanel>
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
      <PluginPanel title={title} description={description}>
        <KSDetailsNodePoolsWrapper
          instance={instance}
          resourceGroup={options.kubernetesservices.resourceGroup}
          managedCluster={options.kubernetesservices.managedCluster}
        />
      </PluginPanel>
    );
  }

  if (
    options?.type &&
    options?.type === 'kubernetesservices' &&
    options.kubernetesservices &&
    options.kubernetesservices.type === 'metrics' &&
    options.kubernetesservices.resourceGroup &&
    options.kubernetesservices.managedCluster &&
    options.kubernetesservices.metricNames &&
    options.kubernetesservices.aggregationType &&
    times
  ) {
    return (
      <PluginPanel title={title} description={description}>
        <Metric
          instance={instance}
          resourceGroup={options.kubernetesservices.resourceGroup}
          provider={providerKS + options.kubernetesservices.managedCluster}
          metricNames={options.kubernetesservices.metricNames}
          aggregationType={options.kubernetesservices.aggregationType}
          times={times}
        />
      </PluginPanel>
    );
  }

  // Panel for virtual machine scale sets
  if (
    options?.type &&
    options?.type === 'virtualmachinescalesets' &&
    options.virtualmachinescalesets &&
    options.virtualmachinescalesets.type === 'list' &&
    options.virtualmachinescalesets.resourceGroups
  ) {
    return (
      <PluginPanel title={title} description={description}>
        <VMSSVirtualMachineScaleSets
          instance={instance}
          resourceGroups={options.virtualmachinescalesets.resourceGroups}
          setDetails={setDetails}
        />
      </PluginPanel>
    );
  }

  if (
    options?.type &&
    options?.type === 'virtualmachinescalesets' &&
    options.virtualmachinescalesets &&
    options.virtualmachinescalesets.type === 'details' &&
    options.virtualmachinescalesets.resourceGroup &&
    options.virtualmachinescalesets.virtualMachineScaleSet
  ) {
    return (
      <PluginPanel title={title} description={description}>
        <VMSSDetailsVirtualMachineScaleSets
          instance={instance}
          resourceGroup={options.virtualmachinescalesets.resourceGroup}
          virtualMachineScaleSet={options.virtualmachinescalesets.virtualMachineScaleSet}
        />
      </PluginPanel>
    );
  }

  if (
    options?.type &&
    options?.type === 'virtualmachinescalesets' &&
    options.virtualmachinescalesets &&
    options.virtualmachinescalesets.type === 'virtualMachines' &&
    options.virtualmachinescalesets.resourceGroup &&
    options.virtualmachinescalesets.virtualMachineScaleSet
  ) {
    return (
      <PluginPanel title={title} description={description}>
        <VMSSDetailsVirtualMachines
          instance={instance}
          resourceGroup={options.virtualmachinescalesets.resourceGroup}
          virtualMachineScaleSet={options.virtualmachinescalesets.virtualMachineScaleSet}
        />
      </PluginPanel>
    );
  }

  if (
    options?.type &&
    options?.type === 'virtualmachinescalesets' &&
    options.virtualmachinescalesets &&
    options.virtualmachinescalesets.type === 'metrics' &&
    options.virtualmachinescalesets.resourceGroup &&
    options.virtualmachinescalesets.virtualMachineScaleSet &&
    options.virtualmachinescalesets.metricNames &&
    options.virtualmachinescalesets.aggregationType &&
    times
  ) {
    return (
      <PluginPanel title={title} description={description}>
        <Metric
          instance={instance}
          resourceGroup={options.virtualmachinescalesets.resourceGroup}
          provider={
            options.virtualmachinescalesets.virtualMachine
              ? providerVMSS +
                options.virtualmachinescalesets.virtualMachineScaleSet +
                '/virtualMachines/' +
                options.virtualmachinescalesets.virtualMachine.replace(
                  options.virtualmachinescalesets.virtualMachineScaleSet + '_',
                  '',
                )
              : providerVMSS + options.virtualmachinescalesets.virtualMachineScaleSet
          }
          metricNames={options.virtualmachinescalesets.metricNames}
          aggregationType={options.virtualmachinescalesets.aggregationType}
          times={times}
        />
      </PluginPanel>
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Options for Azure panel are missing or invalid"
      details="The panel doesn't contain the required options to get data from Azure."
      documentation="https://kobs.io/main/plugins/azure"
    />
  );
};

export default Panel;
