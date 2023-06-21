export const description =
  'A distributed, RESTful search and analytics engine capable of addressing a growing number of use cases.';

export const example = `plugin:
  name: datadog
  type: datadog
  options:
    type: logs
    queries:
      - name: CloudWatch Logs
        query: "@service:cloudwatch"`;

/**
 * `IDataView` is the structure of the instance options for the data views.
 */
export interface IDataView {
  indexPattern?: string;
  name?: string;
  timestampField?: string;
}

/**
 * `ILogsData` is the interface of the data returned from our Go API for the Elasticsearch plugin. The interface must
 * have the same fields as the Data struct from the Go implementation.
 *
 * The `fields` property is not present in the Go struct and only generated on the client side.
 */
export interface ILogsData {
  buckets?: IBucket[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  documents?: Record<string, any>[];
  fields?: string[];
  hits: number;
  took: number;
}

export interface IBucket {
  doc_count: number;
  key: number;
}
