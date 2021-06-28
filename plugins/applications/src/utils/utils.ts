import { IDashboardReference } from '@kobsio/plugin-dashboards';
import cytoscape from 'cytoscape';

export interface IApplication {
  cluster: string;
  namespace: string;
  name: string;
  description?: string;
  links?: ILink[];
  teams?: IReference[];
  dependencies?: IReference[];
  dashboards?: IDashboardReference[];
}

export interface ILink {
  title: string;
  link: string;
}

export interface IReference {
  cluster?: string;
  namespace?: string;
  name: string;
  description?: string;
}

export type TView = 'gallery' | 'topology';

export interface IPanelOptions {
  view?: TView;
  clusters?: string[];
  namespaces?: string[];
  team?: IReference;
}

export interface INode extends cytoscape.ElementDefinition {
  data: INodeData;
}

export interface INodeData extends IApplication {
  id: string;
  type: string;
  label: string;
  parent: string;
}

export interface IEdge extends cytoscape.ElementDefinition {
  data: IEdgeData;
}

export interface IEdgeData {
  id: string;
  source: string;
  target: string;
  description: string;
}
