// IMetrics implements the interface for the corresponding Go struct, which is returned by our API. It contains a list
// of metrics, the start and end time and the minimum and maximum value accross all time series.
export interface IMetrics {
  startTime: number;
  endTime: number;
  min: number;
  max: number;
  metrics?: IMetric[];
}

// IMetric implements the interface for the corresponding Go struct, which is returned by our API. It contains one
// additional field named "color", which is used to specify the color for a line, when the user selected a single line
// in the legend. The data points are implemented by the IDatum interface.
export interface IMetric {
  id: number;
  label: string;
  color?: string;
  min: number;
  max: number;
  avg: number;
  data: IDatum[];
}

export interface IDatum {
  x: number | Date;
  y: number;
}

// IRows implements the interface for the rows in get table data request. The result has the join value as id and for
// this id a list for possible columns and there values (IRowValues).
export interface IRows {
  [key: string]: IRowValues;
}

export interface IRowValues {
  [key: string]: string;
}

// IPanelOptions is the interface, which implements the options property for the panel of the Prometheus plugin. A user
// can specify the chart type which should be used (default: "line"), a unit for the left axis, if the values should be
// stacked, the legend (by default no legend is displayed), some mappings for a singlestat, queries, mappings and
// columns.
export interface IPanelOptions {
  type?: string;
  unit?: string;
  stacked?: boolean;
  legend?: string;
  yAxis?: IYAxis;
  mappings?: IMappings;
  queries?: IQuery[];
  columns?: IColumn[];
}

export interface IMappings {
  [key: string]: string;
}

export interface IQuery {
  query?: string;
  label?: string;
}

export interface IColumn {
  name?: string;
  title?: string;
  unit?: string;
  mappings?: IMappings;
}

export interface IYAxis {
  min: string | number;
  max: string | number;
}
