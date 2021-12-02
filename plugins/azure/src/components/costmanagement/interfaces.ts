export interface IQueryResult {
  properties: IQueryProperties;
}

export interface IQueryProperties {
  columns: IQueryColumn[];
  rows: any[][];
}

export interface IQueryColumn {
  name: string;
  type: string;
}

export interface PieDatum {
  id: string;
  label: string;
  value: number;
}
