import { IReference as IDashboardReference, IPlugin } from './dashboard';

// IApplication implements the Application CR, which can be created by a user to describe an application. While we have
// to omit the cluster, namespace and name field in the Go implementation of the CR, we can assume that these fields are
// present in the frontend, because they will always be set when an application is returned from the Kubernetes API.
export interface IApplication {
  cluster: string;
  namespace: string;
  name: string;
  description?: string;
  tags?: string[];
  links?: IApplicationLink[];
  teams?: IApplicationReference[];
  dependencies?: IApplicationReference[];
  preview?: IPreview;
  dashboards?: IDashboardReference[];
}

export interface IPreview {
  title: string;
  plugin: IPlugin;
}

export interface IApplicationLink {
  title: string;
  link: string;
}

// The IApplicationReference is the interface, which is used to create a reference to a team or an application. While
// the team can be used to describe the ownership of the application, the application references are used to identify
// dependencies between applications.
export interface IApplicationReference {
  cluster?: string;
  namespace?: string;
  name: string;
  description?: string;
}
