// IUser is the interface for a User CR. The interface must implement the same fields as the Users CRD. the only
// different is that we can be sure that the cluster, namespace and name of a user is always present in the frontend,
// because it will be set when a user is retrieved from the Kubernetes API.
export interface IUser {
  cluster: string;
  namespace: string;
  name: string;
  id: string;
  fullName: string;
  email: string;
  position?: string;
  bio?: string;
  teams?: ITeam[];
}

export interface ITeam {
  cluster?: string;
  namespace?: string;
  name: string;
}

export interface IPanelOptions {
  cluster?: string;
  namespace?: string;
  name?: string;
}
