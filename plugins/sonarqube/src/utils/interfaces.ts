// IOptions is the interface for the options on the SonarQube page.
export interface IOptions {
  query: string;
}

export interface IPanelOptions {
  project?: string;
  metricKeys?: string[];
}

// IResponseProjects is the interface for the returned data from the API, for a call to get projects.
export interface IResponseProjects {
  paging: IPaging;
  components: IProject[];
}

export interface IPaging {
  pageIndex: number;
  pageSize: number;
  total: number;
}

export interface IProject {
  key: string;
  name: string;
  qualifier: string;
  visibility: string;
  lastAnalysisDate: string;
  revision: string;
}

// IResponseProjectMeasures is the interface for the returned data from the API, for a call to get measures for a
// project.
export interface IResponseProjectMeasures {
  component: IProjectMeasures;
  metrics: IMetric[];
}

export interface IProjectMeasures {
  key: string;
  name: string;
  description: string;
  qualifier: string;
  measures: IMeasure[];
}

export interface IMeasure {
  metric: string;
  value: string;
  bestValue: boolean;
}

export interface IMetric {
  key: string;
  name: string;
  description: string;
  domain: string;
  type: string;
  higherValuesAreBetter: boolean;
  qualitative: boolean;
  hidden: boolean;
  decimalScale: number;
  bestValue: string;
  worstValue: string;
}
