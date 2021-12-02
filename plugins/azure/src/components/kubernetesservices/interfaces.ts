import { ContainerServiceModels } from '@azure/arm-containerservice';

export interface IManagedCluster extends ContainerServiceModels.Resource {
  properties?: ContainerServiceModels.ManagedCluster;
}

export interface INodePool extends ContainerServiceModels.Resource {
  properties?: ContainerServiceModels.AgentPool;
}
