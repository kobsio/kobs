export interface IOptions {
  all: boolean;
  clusterIDs: string[];
  external: string;
  namespaceIDs: string[];
  page: number;
  perPage: number;
  searchTerm: string;
  tags: string[];
}

export interface IDatum {
  x: number;
  y: number;
}
