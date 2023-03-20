/* eslint-disable typescript-sort-keys/interface */

import { TTime } from '@kobsio/core';

export type AxisOp = 'count' | 'min' | 'max' | 'sum' | 'avg';

interface IPieChartOptions {
  chart: 'pie';
  sliceBy: string;
  sizeByOperation: AxisOp;
  sizeByField: string;
}

interface IBarChartOptions {
  chart: 'bar';
  horizontalAxisOperation: 'time' | 'top';
  verticalAxisOperation: AxisOp;
  verticalAxisField: string;
  breakDownByFields: string[];
  breakDownByFilters: string[];
}

interface ILineChartOptions {
  chart: 'line';
  horizontalAxisOperation: 'time';
  verticalAxisOperation: AxisOp;
  verticalAxisField: string;
  breakDownByFields: string[];
  breakDownByFilters: string[];
}

interface IAreaChartOptions {
  chart: 'area';
  horizontalAxisOperation: 'time';
  verticalAxisOperation: AxisOp;
  verticalAxisField: string;
  breakDownByFields: string[];
  breakDownByFilters: string[];
}

type IChartOptions = IBarChartOptions | IPieChartOptions | ILineChartOptions | IAreaChartOptions;

interface IBaseSearch {
  query: string;
  time: TTime;
  timeEnd: number;
  timeStart: number;
}

export type IAggregationSearch = IChartOptions & IBaseSearch;

// IAggregationDataRow is the interface for a single row returned by the aggregation API. It contains the column name as
// key and the cell value for the row/column as value. The value could be a string, for the selected fields in the
// aggregation or a number for the value of the fields combination.
export interface IAggregationDataRow {
  [key: string]: string | number | null;
}

// IAggregationData is the data returned by the aggregation API call. It contains a list of columns and a list of rows.
export interface IAggregationData {
  columns: string[];
  rows: IAggregationDataRow[];
}

export interface ISeries {
  name: string;
  data: ISeriesDatum[];
}

export interface ISeriesDatum {
  x: Date;
  y: number | null;
}
