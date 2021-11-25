import containerInstancesIcon from '../assets/services/container-instances.svg';

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
};
