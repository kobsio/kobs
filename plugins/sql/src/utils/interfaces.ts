// IOptions is the interface for all options, which can be set for an SQL query.
export interface IOptions {
  query: string;
}

// IPanelOptions are the options for the panel component of the SQL plugin.
export interface IPanelOptions {
  type?: string;
  queries?: IQuery[];
}

export interface IQuery {
  name?: string;
  query?: string;
  columns?: IColumns;
}

export interface IColumns {
  [key: string]: IColumn;
}

export interface IColumn {
  title?: string;
  format?: string;
}

// ISQLData is the interface of the data returned from our Go API for the get query results call.
export interface ISQLData {
  columns?: string[];
  rows?: ISQLDataRow[];
}

export interface ISQLDataRow {
  [key: string]: string | number | string[] | number[];
}
