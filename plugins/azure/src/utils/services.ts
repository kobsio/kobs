import containerInstancesIcon from '../assets/services/container-instances.svg';
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
  kubernetesservices: {
    description: 'Deploy and scale containers on managed Kubernetes',
    icon: kubernetesServicesIcon,
    name: 'Kubernetes Services',
    provider: 'Microsoft.ContainerService/managedClusters/',
  },
};
