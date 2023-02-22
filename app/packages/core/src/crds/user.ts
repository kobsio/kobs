import { IReference } from './dashboard';

export interface IUser {
  id: string;
  updatedAt: number;
  cluster: string;
  namespace: string;
  name: string;
  permissions: IPermissions;
  dashboards?: IReference[];
  navigation?: INavigation[];
}

export interface IPermissions {
  applications?: IApplicationPermissions[];
  teams?: string[];
  plugins?: IPluginPermissions[];
  resources?: IResourcesPermissions[];
}

export interface IApplicationPermissions {
  type: string;
  clusters?: string[];
  namespaces?: string[];
}

export interface IPluginPermissions {
  cluster: string;
  name: string;
  type: string;
  permissions?: unknown;
}

export interface IResourcesPermissions {
  clusters: string[];
  namespaces: string[];
  resources: string[];
  verbs: string[];
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
