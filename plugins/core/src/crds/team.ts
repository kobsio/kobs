import { IReference as IDashboardReference } from './dashboard';

// The ITeam interface implements the Team CRD.
export interface ITeam {
  cluster: string;
  namespace: string;
  name: string;
  id: string;
  description?: string;
  links?: ITeamLink[];
  logo?: string;
  dashboards?: IDashboardReference[];
}

export interface ITeamLink {
  title: string;
  link: string;
}
