export const description = 'Fast, scalable and reliable logging using Fluent Bit and ClickHouse.';

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
