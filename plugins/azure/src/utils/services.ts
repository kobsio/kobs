import containerInstancesIcon from '../assets/services/container-instances.svg';
import costManagementIcon from '../assets/services/cost-management.svg';

export interface IServices {
  [key: string]: IService;
}

export interface IService {
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  name: string;
}

export const services: IServices = {
  containerinstances: {
    description: 'Easily run containers on Azure without managing servers',
    icon: containerInstancesIcon,
    name: 'Container Instances',
  },
  costmanagement: {
    description: 'Cost Management helps you understand your Azure invoice',
    icon: costManagementIcon,
    name: 'Cost Management',
  },
};
