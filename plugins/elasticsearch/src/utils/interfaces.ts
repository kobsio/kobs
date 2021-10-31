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
  queries?: IQuery[];
  showChart?: boolean;
}

export interface IQuery {
  name?: string;
  query?: string;
  fields?: string[];
}

// ILogsData is the interface of the data returned from our Go API for the Elasticsearch plugin. The interface must
// have the same fields as the Data struct from the Go implementation.
export interface ILogsData {
  took: number;
  hits: number;
  documents: IDocument[];
  buckets?: IBucket[];
}

export interface IDocument {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// IBucket is the interface for a single bucket returned by the Elasticsearch API. For that we are using the naming
// convention from Elasticsearch.
export interface IBucket extends BarDatum {
  key: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  doc_count: number;
}

// IKeyValue is the interface for a single field in a document, with it's key and value.
export interface IKeyValue {
  key: string;
  value: string;
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
