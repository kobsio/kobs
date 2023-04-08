import { IPlugin, IReference } from './dashboard';

export interface IApplication {
  cluster: string;
  dashboards?: IReference[];
  description?: string;
  id: string;
  insights?: IInsight[];
  links?: ILink[];
  name: string;
  namespace: string;
  tags?: string[];
  teams?: string[];
  topology?: ITopology;
  updatedAt: number;
}

export interface IInsight {
  mappings?: Record<string, string>;
  plugin: IPlugin;
  title: string;
  type: string;
  unit?: string;
}

export interface ILink {
  link: string;
  title: string;
}

export interface ITopology {
  dependencies?: IDependency[];
  external?: boolean;
}

export interface IDependency {
  cluster: string;
  description?: string;
  name: string;
  namespace: string;
}
