import { IReference } from './dashboard';

export interface IUser {
  id: string;
  updatedAt: number;
  cluster: string;
  namespace: string;
  name: string;
  dashboards?: IReference[];
  navigation?: INavigation;
}

export interface INavigation {
  name: string;
  items: INavigationItem[];
}

export interface INavigationItem {
  name: string;
  link?: string;
  icon?: string;
  items?: INavigationSubItem[];
}

export interface INavigationSubItem {
  name: string;
  link?: string;
}
