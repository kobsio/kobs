import { Serie } from '@nivo/line';

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
  x: number;
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

// ILabels is the interface for all labels in a series. It contains the series id as key and the label as values. This
// allows us to access the label via a serie, which was converted from the retunred metrics.
export interface ILabels {
  [key: string]: string;
}

// ISeries is the interface which is retunred by the convertMetrics function. It contains the converted series and all
// labels for these series.
export interface ISeries {
  startTime: number;
  endTime: number;
  labels: ILabels;
  max: number;
  min: number;
  series: Serie[];
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
