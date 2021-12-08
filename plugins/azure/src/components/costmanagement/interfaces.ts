export interface IQueryResult {
  properties: IQueryProperties;
}

export interface IQueryProperties {
  columns: IQueryColumn[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[][];
}

export interface IQueryColumn {
  name: string;
  type: string;
}

export interface IPieDatum {
  id: string;
  label: string;
  value: number;
}
