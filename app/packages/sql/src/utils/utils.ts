export const description = 'Access the data of an relational database management system.';

export const example = `# Table
plugin:
  name: sql
  type: sql
  options:
    query: SELECT * FROM table LIMIT 100`;

/**
 * `ISQLData` is the interface for the data returned by our Go API. It contains a list of columns and rows to render a
 * table or chart.
 */
export interface ISQLData {
  columns?: string[];
  rows?: ISQLDataRow[];
}

export interface ISQLDataRow {
  [key: string]: string | number | string[] | number[];
}

/**
 * `IColumns` is the interface for the columns of a table, which can be set by a user to format the value in the
 * specific column.
 */
export interface IColumns {
  [key: string]: IColumn;
}

export interface IColumn {
  title?: string;
  unit?: string;
}

/**
 * `IChart` is the interface for the chart options, which can be set by a user to render a chart.
 */
export interface IChart {
  legend?: ILegend;
  pieLabelColumn?: string;
  pieValueColumn?: string;
  query?: string;
  thresholds?: IThresholds;
  type?: string;
  xAxisColumn?: string;
  xAxisType?: string;
  xAxisUnit?: string;
  yAxisColumns?: string[];
  yAxisGroup?: string;
  yAxisStacked?: boolean;
  yAxisUnit?: string;
}

export interface ILegend {
  [key: string]: string;
}

export interface IThresholds {
  [key: string]: string;
}
