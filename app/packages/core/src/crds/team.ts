import { IReference } from './dashboard';

// The ITeam interface implements the Team CRD.
export interface ITeam {
  id: string;
  updatedAt: number;
  cluster: string;
  namespace: string;
  name: string;
  description?: string;
  links?: ILink[];
  logo?: string;
  dashboards?: IReference[];
}

export interface ILink {
  title: string;
  link: string;
}
