export const description = 'Modern monitoring & security. See inside any stack, any app, at any scale, anywhere.';

export const example = `plugin:
  name: datadog
  type: datadog
  options:
    type: logs
    queries:
      - name: CloudWatch Logs
        query: "@service:cloudwatch"`;

/**
 * `ILogData` is the interface for the data returned from a logs request.
 */
export interface ILogData {
  buckets: IBuckets[];
  documents: IDocument[];
  fields: string[];
}

export interface IBuckets {
  computes?: {
    c0?: {
      time: string;
      value: number;
    }[];
  };
}

export interface IDocument {
  attributes?: IDocumentAttributes;
  id?: string;
  type?: string;
}

export interface IDocumentAttributes {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes?: Record<string, any>;
  host?: string;
  message?: string;
  service?: string;
  status?: string;
  tags?: string[];
  timestamp?: string;
}
