export const description = 'SonarQube empowers all developers to write cleaner and safer code.';

/**
 * `IResponseProjects` is the interface for the returned data from the API, for a call to get projects.
 */
export interface IResponseProjects {
  components: IProject[];
  paging: IPaging;
}

export interface IPaging {
  pageIndex: number;
  pageSize: number;
  total: number;
}

export interface IProject {
  key: string;
  name: string;
  organization: string;
  project: string;
  qualifier: string;
}

/**
 * `IResponseProjectMeasures` is the interface for the returned data from the API, for a call to get measures for a
 * project.
 */
export interface IResponseProjectMeasures {
  component: IProjectMeasures;
  metrics: IMetric[];
}

export interface IProjectMeasures {
  description: string;
  key: string;
  measures: IMeasure[];
  name: string;
  qualifier: string;
}

export interface IMeasure {
  bestValue?: boolean;
  metric: string;
  value: string;
}

export interface IMetric {
  bestValue: string;
  decimalScale: number;
  description: string;
  domain: string;
  hidden: boolean;
  higherValuesAreBetter: boolean;
  key: string;
  name: string;
  qualitative: boolean;
  type: string;
  worstValue: string;
}
