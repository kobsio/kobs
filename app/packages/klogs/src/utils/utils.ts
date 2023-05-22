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

export const defaultCompletions = [
  { info: 'equals', label: '=', type: 'keyword' },
  { info: 'not equals', label: '!=', type: 'keyword' },
  { info: 'smaller', label: '<', type: 'keyword' },
  { info: 'smaller or equal', label: '<=', type: 'keyword' },
  { info: 'greater', label: '>', type: 'keyword' },
  { info: 'greater or equal', label: '>=', type: 'keyword' },
  { info: 'ILIKE', label: '=~', type: 'keyword' },
  { info: 'not ILIKE', label: '!~', type: 'keyword' },
  { info: 'regex match', label: '~', type: 'keyword' },

  { info: 'and statement', label: '_and_', type: 'keyword' },
  { info: 'or statement', label: '_or_', type: 'keyword' },
  { info: 'not statement', label: '_not_', type: 'keyword' },
  { info: 'exists statement', label: '_exists_', type: 'keyword' },
];
