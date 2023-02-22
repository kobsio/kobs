import { IReference } from './dashboard';

export interface IUser {
  cluster: string;
  dashboards?: IReference[];
  id: string;
  name: string;
  namespace: string;
  navigation?: INavigation[];
  permissions: IPermissions;
  updatedAt: number;
}

export interface IPermissions {
  applications?: IApplicationPermissions[];
  plugins?: IPluginPermissions[];
  resources?: IResourcesPermissions[];
  teams?: string[];
}

export interface IApplicationPermissions {
  clusters?: string[];
  namespaces?: string[];
  type: string;
}

export interface IPluginPermissions {
  cluster: string;
  name: string;
  permissions?: unknown;
  type: string;
}

export interface IResourcesPermissions {
  clusters: string[];
  namespaces: string[];
  resources: string[];
  verbs: string[];
}

export interface INavigation {
  items: INavigationItem[];
  name: string;
}

export interface INavigationItem {
  icon?: string;
  items?: INavigationSubItem[];
  link?: string;
  name: string;
}

export interface INavigationSubItem {
  link?: string;
  name: string;
}
