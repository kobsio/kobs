import cytoscape from 'cytoscape';

import { IApplication, IApplicationTeamReference, IDashboardReference, IPluginTimes } from '@kobsio/plugin-core';

// IOptions is the interface for all options for the applications page.
export interface IOptions {
  clusters: string[];
  namespaces: string[];
  tags: string[];
  view: TView;
  times: IPluginTimes;
}

// TView are the two options we have to present a list of applications to the user. This can be a gallery view, where
// it will be possible add a single plugin to the card or the topology view, which can be used to display the
// dependencies between applications.
export type TView = 'gallery' | 'topology';

// IPanelOptions is the interface for the options object which is passed to the panel for the application. We always
// have to check if the provided fields are correct, because we are using a simple JSON type in the CRD.
export interface IPanelOptions {
  view?: TView;
  clusters?: string[];
  namespaces?: string[];
  tags?: string[];
  team?: IApplicationTeamReference;
}

// INode is a single node for the topology graph. It implements the ElementDefinition interface from cytoscape.
export interface INode extends cytoscape.ElementDefinition {
  data: INodeData;
}

export interface INodeData extends IApplication {
  id: string;
  type: string;
  label: string;
  parent: string;
}

// IEdge is a single edge for the topology graph. It implements the ElementDefinition interface from cytoscape.
export interface IEdge extends cytoscape.ElementDefinition {
  data: IEdgeData;
}

export interface IEdgeData {
  id: string;
  source: string;
  target: string;
  description: string;
  dashboards?: IDashboardReference[];
}
