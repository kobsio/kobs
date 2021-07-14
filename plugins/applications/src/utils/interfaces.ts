import { IDashboardReference, IPlugin } from '@kobsio/plugin-dashboards';
import cytoscape from 'cytoscape';

// IApplication implements the Application CR, which can be created by a user to describe an application. While we have
// to omit the cluster, namespace and name field in the Go implementation of the CR, we can assume that these fields are
// present in the frontend, because they will always be set when an application is returned from the Kubernetes API.
export interface IApplication {
  cluster: string;
  namespace: string;
  name: string;
  description?: string;
  links?: ILink[];
  teams?: IReference[];
  dependencies?: IReference[];
  preview?: IPreview;
  dashboards?: IDashboardReference[];
}

export interface IPreview {
  title: string;
  plugin: IPlugin;
}

export interface ILink {
  title: string;
  link: string;
}

// IReference is the interface, which is used to create a reference to an team or an application. Will the team can be
// used to describe the ownership of the application, the application references are used to identify dependencies.
export interface IReference {
  cluster?: string;
  namespace?: string;
  name: string;
  description?: string;
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
  team?: IReference;
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
}
