import { IPluginTimes } from '@kobsio/plugin-core';

// IOptions is the interface for all options, which can be set for an ClickHouse query.
export interface IOptions {
  fields?: string[];
  query: string;
  times: IPluginTimes;
}

// IPanelOptions are the options for the panel component of the ClickHouse plugin.
export interface IPanelOptions {
  type: string;
  queries?: IQuery[];
}

export interface IQuery {
  name?: string;
  query?: string;
  fields?: string[];
}

// ILogsData is the interface of the data returned from our Go API for the logs view of the ClickHouse plugin.
export interface ILogsData {
  offset: number;
  took?: number;
  fields?: string[];
  documents?: IDocument[];
}

export interface IDocument {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface ILogsCountData {
  count?: number;
}

// ISQLData is the interface of the data returned from our Go API for the sql view of the ClickHouse plugin.
export interface ISQLData {
  columns?: string[];
  rows?: string[][];
}
