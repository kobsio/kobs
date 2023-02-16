import { IPlugin, IReference } from './dashboard';

export interface IApplication {
  id: string;
  updatedAt: number;
  cluster: string;
  namespace: string;
  name: string;
  description?: string;
  tags?: string[];
  links?: ILink[];
  teams?: string[];
  topology?: ITopology;
  insights?: IInsight[];
  dashboards?: IReference[];
}

export interface IInsight {
  title: string;
  type: string;
  unit?: string;
  mappings?: { [key: string]: string };
  plugin: IPlugin;
}

export interface ILink {
  title: string;
  link: string;
}

export interface ITopology {
  external?: boolean;
  dependencies?: IDependency[];
}

export interface IDependency {
  cluster: string;
  namespace: string;
  name: string;
  description?: string;
}
