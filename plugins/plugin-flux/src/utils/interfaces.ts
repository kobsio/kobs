import { AlertVariant } from '@patternfly/react-core';

import { ITimes } from '@kobsio/shared';

export interface IPanelOptions {
  type?: string;
  cluster?: string;
  namespace?: string;
  selector?: string;
  name?: string;
}

// IOptions is the interface for the options which can be set by a user in the Page component for a plugin.
export interface IOptions {
  type: TType;
  cluster: string;
  namespace: string;
  times: ITimes;
}

export type TType = 'gitrepositories' | 'helmrepositories' | 'buckets' | 'kustomizations' | 'helmreleases';

export type TResource = {
  [key in TType]: IResource;
};

export interface IResource {
  title: string;
  resource: string;
  path: string;
  columns: IResourceColumn[];
}

export interface IResourceColumn {
  title: string;
  jsonPath: string;
  type: string;
}

// IAlert is the interface for an alert. An alert in this component can be an error, when the fetchApplication fails or
// an information, which explains a dependency.
export interface IAlert {
  title: string;
  variant: AlertVariant;
}

// IArtifact and ICrossNamespaceObjectReference are interfaces for parts of the custom resources for Flux.
export interface IArtifact {
  checksum?: string;
  lastUpdateTime?: string;
  path?: string;
  revision?: string;
  url?: string;
}

export interface ICrossNamespaceObjectReference {
  apiVersion?: string;
  kind?: string;
  name?: string;
  namespace?: string;
}
