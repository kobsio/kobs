export interface IClusters {
  [satellite: string]: ICluster[];
}

export interface ICluster {
  id: string;
  cluster: string;
  satellite: string;
  updatedAt: number;
}

export interface INamespaces {
  [cluster: string]: INamespace[];
}

export interface INamespace {
  id: string;
  namespace: string;
  cluster: string;
  satellite: string;
  clusterID: string;
  updatedAt: number;
}
