export interface IOptions {
  all: boolean;
  clusterIDs: string[];
  external: string;
  namespaces: string[];
  page: number;
  perPage: number;
  searchTerm: string;
  tags: string[];
}

export interface IDatum {
  x: Date;
  y: number;
}
