import { BarDatum } from '@nivo/bar';

import { IPluginTimes } from '@kobsio/plugin-core';

// IOptions is the interface for all options, which can be set for an Elasticsearch query.
export interface IOptions {
  fields?: string[];
  query: string;
  times: IPluginTimes;
}

// IPanelOptions are the options for the panel component of the Elasticsearch plugin.
export interface IPanelOptions {
  fields?: string[];
  query?: string;
  showChart?: boolean;
}

// ILogsData is the interface of the data returned from our Go API for the Elasticsearch plugin. The interface must
// have the same fields as the Data struct from the Go implementation.
export interface ILogsData {
  scrollID: string;
  took: number;
  hits: number;
  documents: IDocument[];
  buckets?: IBucket[];
}

export interface IDocument {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface IBucket extends BarDatum {
  time: string;
  documents: number;
}

// IKeyValue is the interface for a single field in a document, with it's key and value.
export interface IKeyValue {
  key: string;
  value: string;
}
