import { ITimes } from '@kobsio/shared';

// IOptions is the interface for all options, which can be set for an klogs query.
export interface IOptions {
  fields?: string[];
  order: string;
  orderBy: string;
  query: string;
  times: ITimes;
}

// IPanelOptions are the options for the panel component of the klogs plugin.
export interface IPanelOptions {
  type: string;
  queries?: IQuery[];
  aggregation: IAggregationOptions;
}

export interface IQuery {
  name?: string;
  query?: string;
  fields?: string[];
  order?: string;
  orderBy?: string;
}

// ILogsData is the interface of the data returned from our Go API for the logs view of the klogs plugin.
export interface ILogsData {
  offset: number;
  timeStart: number;
  count?: number;
  took?: number;
  fields?: string[];
  documents?: IDocument[];
  buckets?: IBucket[];
}

export interface IDocument {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface IBucket {
  interval: number;
  count: number;
}

// IDatum, ILabel and IDomain interfaces are used for the logs chart. IDatum is the formate of the data points required
// by '@patternfly/react-charts. ILabel is the formate of the label and IDomain is the formate returned by the
// onBrushDomainChangeEnd function.
export interface IDatum {
  x: Date;
  y: number;
}

export interface ILabel {
  datum: IDatum;
}

export interface IDomain {
  x: Date[];
  y: number[];
}

// IAggregationOptions are the options which can be set by a user for an aggregation. It contains the query, start and
// end time, the chart and the data to create the aggregation.
export interface IAggregationOptions {
  query: string;
  times: ITimes;
  chart: string;
  options: IAggregationOptionsAggregation;
}

// IAggregationOptionsAggregation is the interface for an aggregation:
// - The "sliceBy", "sizeByOperation" and "sizeByField" is required, when a user choosed a pie chart as visualization
//   type. The latter one is only needed if the user did not choose "count" for "sizeByOperation".
// - The values for the horizontal axis are needed for the bar, line and area chart. The "horizontalAxisField",
//   "horizontalAxisOrder" and "horizontalAxisLimit" can only be set, when the "horizontalAxisOperation" is "top".
// - For the vertical axis we need to now the "verticalAxisOperation" and "verticalAxisField" values, where the latter
//   one is only required when the "verticalAxisOperation" is not "count"
// - Finally the user can also break down his aggregation, via a list of fields ("breakDownByFields") or a list of
//   filters ("breakDownByFilters").
export interface IAggregationOptionsAggregation {
  sliceBy: string;
  sizeByOperation: string;
  sizeByField: string;

  horizontalAxisOperation: string;
  horizontalAxisField: string;
  horizontalAxisOrder: string;
  horizontalAxisLimit: string;

  verticalAxisOperation: string;
  verticalAxisField: string;

  breakDownByFields: string[];
  breakDownByFilters: string[];
}

// IAggregationData is the data returned by the aggregation API call. It contains a list of columns and a list of rows.
export interface IAggregationData {
  columns: string[];
  rows: IAggregationDataRow[];
}

// IAggregationDataRow is the interface for a single row returned by the aggregation API. It contains the column name as
// key and the cell value for the row/column as value. The value could be a string, for the selected fields in the
// aggregation or a number for the value of the fields combination.
export interface IAggregationDataRow {
  [key: string]: string | number | null;
}
