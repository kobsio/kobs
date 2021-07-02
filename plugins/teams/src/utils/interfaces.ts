import { IDashboardReference } from '@kobsio/plugin-dashboards';

// ITeam is the interface for a Team CR. The interface must implement the same fields as the Teams CRD. the only
// different is that we can be sure that the cluster, namespace and name of a team is always present in the frontend,
// because it will be set when a team is retrieved from the Kubernetes API.
export interface ITeam {
  cluster: string;
  namespace: string;
  name: string;
  description?: string;
  links?: ILink[];
  logo?: string;
  dashboards?: IDashboardReference[];
}

export interface ILink {
  title: string;
  link: string;
}
