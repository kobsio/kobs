import { INotifications } from './user';
import { IReference } from './dashboard';

// The ITeam interface implements the Team CRD.
export interface ITeam {
  id: string;
  satellite: string;
  updatedAt: number;
  cluster: string;
  namespace: string;
  name: string;
  group: string;
  description?: string;
  links?: ILink[];
  logo?: string;
  dashboards?: IReference[];
  notifications?: INotifications;
}

export interface ILink {
  title: string;
  link: string;
}
