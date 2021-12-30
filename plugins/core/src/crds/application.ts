import { IDashboardPlugin, IDashboardReference } from './dashboard';

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
  teams?: IApplicationTeamReference[];
  topology?: IApplicationTopology;
  preview?: IApplicationPreview;
  dashboards?: IDashboardReference[];
}

export interface IApplicationPreview {
  title: string;
  plugin: IDashboardPlugin;
}

export interface IApplicationLink {
  title: string;
  link: string;
}

export interface IApplicationTopology {
  type?: string;
  external?: boolean;
  dependencies?: IApplicationDependency[];
}

export interface IApplicationDependency {
  cluster?: string;
  namespace?: string;
  name: string;
  description?: string;
  dashboards?: IDashboardReference[];
}

// The IApplicationTeamReference is the interface, which is used to create a reference to a team. This can be used to
// describe the ownership for applications.
export interface IApplicationTeamReference {
  cluster?: string;
  namespace?: string;
  name: string;
  description?: string;
}
