// IQueryOptions are the options which can be set by a user for a query.
export interface IQueryOptions {
  operation: QueryOperationType | undefined;
  query: string;
}

export const QueryOperationTypes = {
  count: 'count',
  find: 'find',
};

export type QueryOperationType = keyof typeof QueryOperationTypes;

export interface IStatsData {
  db: string;
  collections: string;
  views: number;
  objects: number;
  avgObjSize: number;
  dataSize: number;
  storageSize: number;
  freeStorageSize: number;
  indexes: number;
  indexSize: number;
  indexFreeStorageSize: number;
  totalSize: number;
  totalFreeStorageSize: number;
  scaleFactor: number;
  fsUsedSize: number;
  fsTotalSize: number;
}

export interface ICollectionStatsData {
  ns: string;
  size: number;
  count: number;
  avgObjSize: number;
  numOrphanDocs: number;
  storageSize: number;
  freeStorageSize: number;
  nindexes: number;
  totalIndexSize: number;
  totalSize: number;
}
