export type IRow = Record<string, string | number | string[] | number[]>;

export interface ITablePanelOptions {
  queries: IQuery[];
  type: 'table';
}

export interface IChartPanelOptions {
  chart: IChart;
  type: 'chart';
}

export interface IQuery {
  columns?: IColumns;
  name?: string;
  query: string;
}

export interface IColumns {
  [key: string]: IColumn;
}

export interface IColumn {
  title?: string;
  unit?: string;
}

export interface ISingleStatsChart {
  legend?: ILegend;
  thresholds?: IThresholds;
  yAxisColumns: string[];
  yAxisUnit?: string;
}

export interface IPieChart {
  pieLabelColumn: string;
  pieValueColumn: string;
}

export interface IGenericChart {
  legend?: ILegend;
  type: 'area' | 'bar' | 'line';
  xAxisColumn: string;
  xAxisType?: string;
  yAxisColumns: string[];
  yAxisGroup?: string;
  yAxisStacked?: boolean;
  yAxisUnit?: string;
}

export type IChart = ISingleStatsChart | IPieChart | IGenericChart;

export interface ILegend {
  [key: string]: string;
}

export interface IThresholds {
  [key: string]: string;
}

// ISQLData is the interface of the data returned from our Go API for the get query results call.
export interface ISQLData {
  columns?: string[];
  rows?: ISQLDataRow[];
}

export interface ISQLDataRow {
  [key: string]: string | number | string[] | number[];
}

export interface IMetrics {
  data: IDatum[];
  name: string;
}

export interface IDatum {
  x: number | Date;
  y: number | null;
}
