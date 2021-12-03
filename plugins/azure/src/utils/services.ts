import containerInstancesIcon from '../assets/services/container-instances.svg';
import costManagementIcon from '../assets/services/cost-management.svg';
import kubernetesServicesIcon from '../assets/services/kubernetes-services.svg';

export interface IServices {
  [key: string]: IService;
}

export interface IService {
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  name: string;
  provider: string;
}

export const services: IServices = {
  containerinstances: {
    description: 'Easily run containers on Azure without managing servers',
    icon: containerInstancesIcon,
    name: 'Container Instances',
    provider: 'Microsoft.ContainerInstance/containerGroups/',
  },
  costmanagement: {
    description: 'Cost Management helps you understand your Azure invoice',
    icon: costManagementIcon,
    name: 'Cost Management',
    provider: 'Microsoft.CostManagement/query/',
  },
  kubernetesservices: {
    description: 'Deploy and scale containers on managed Kubernetes',
    icon: kubernetesServicesIcon,
    name: 'Kubernetes Services',
    provider: 'Microsoft.ContainerService/managedClusters/',
  },
};
