import { IReference } from './dashboard';

// The ITeam interface implements the Team CRD.
export interface ITeam {
  cluster: string;
  dashboards?: IReference[];
  description?: string;
  id: string;
  links?: ILink[];
  logo?: string;
  name: string;
  namespace: string;
  updatedAt: number;
}

export interface ILink {
  link: string;
  title: string;
}
