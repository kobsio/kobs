import { ContainerInstanceManagementModels } from '@azure/arm-containerinstance';

export interface IContainerGroup extends ContainerInstanceManagementModels.Resource {
  properties?: IContainerGroupProperties;
}

export interface IContainerGroupProperties
  extends Omit<ContainerInstanceManagementModels.ContainerGroup, 'containers' | 'initContainers'> {
  containers?: IContainer[];
  initContainers?: IInitContainer[];
}

export interface IContainer {
  name?: string;
  properties?: ContainerInstanceManagementModels.Container;
}

export interface IInitContainer {
  name?: string;
  properties?: ContainerInstanceManagementModels.InitContainerDefinition;
}

export interface IContainerLogs {
  logs: string;
}
