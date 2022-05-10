import { IPlugin, IReference } from './dashboard';

export interface IApplication {
  id: string;
  satellite: string;
  updatedAt: number;
  cluster: string;
  namespace: string;
  name: string;
  description?: string;
  tags?: string[];
  links?: ILink[];
  teams?: string[];
  topology?: ITopology;
  preview?: IPreview;
  dashboards?: IReference[];
}

export interface IPreview {
  title: string;
  plugin: IPlugin;
}

export interface ILink {
  title: string;
  link: string;
}

export interface ITopology {
  type?: string;
  external?: boolean;
  dependencies?: IDependency[];
}

export interface IDependency {
  satellite: string;
  cluster: string;
  namespace: string;
  name: string;
  description?: string;
}
