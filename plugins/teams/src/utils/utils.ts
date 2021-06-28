import { IDashboardReference } from '@kobsio/plugin-dashboards';

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
