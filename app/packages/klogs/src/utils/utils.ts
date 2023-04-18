export const description = 'Fast, scalable and reliable logging using Fluent Bit and ClickHouse.';

export const example = `plugin:
name: klogs
type: klogs
options:
  type: logs
  queries:
    - name: "Application Logs"
      query: "namespace = 'default' _and_ app = 'application'`;

export interface ILogsData {
  buckets?: {
    count: number;
    interval: number;
  }[];
  count?: number;
  documents?: Record<string, string>[];
  fields?: {
    name: string;
    type: string;
  }[];
  took?: number;
}
