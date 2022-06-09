import { Container, ContainerGroup, InitContainerDefinition, Resource } from '@azure/arm-containerinstance';

export interface IContainerGroup extends Resource {
  properties?: IContainerGroupProperties;
}

export interface IContainerGroupProperties extends Omit<ContainerGroup, 'containers' | 'initContainers'> {
  containers?: IContainer[];
  initContainers?: IInitContainer[];
}

export interface IContainer {
  name?: string;
  properties?: Container;
}

export interface IInitContainer {
  name?: string;
  properties?: InitContainerDefinition;
}

export interface IContainerLogs {
  logs: string;
}
