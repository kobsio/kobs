export interface ITeam {
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

export interface IReference {
  cluster?: string;
  namespace?: string;
  name: string;
  description?: string;
}
