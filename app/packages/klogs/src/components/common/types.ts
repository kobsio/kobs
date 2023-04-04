interface IBucket {
  count: number;
  interval: number;
}

export type IRow = {
  timestamp: string;
} & Record<string, string>;

export interface ILogsData {
  buckets?: IBucket[];
  count?: number;
  documents?: IRow[];
  fields?: string[];
  offset: number;
  timeStart: number;
  took?: number;
}
