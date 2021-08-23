import { AlertVariant } from '@patternfly/react-core';

export interface IPanelOptions {
  type?: string;
  cluster?: string;
  namespace?: string;
  selector?: string;
}

// IOptions is the interface for the options which can be set by a user in the Page component for a plugin.
export interface IOptions {
  type: TType;
  cluster: string;
}

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

export type TType = 'sources' | 'kustomizations' | 'helmreleases';
export type TApiType =
  | 'gitrepositories.source.toolkit.fluxcd.io/v1beta1'
  | 'helmrepositories.source.toolkit.fluxcd.io/v1beta1'
  | 'buckets.source.toolkit.fluxcd.io/v1beta1'
  | 'kustomizations.kustomize.toolkit.fluxcd.io/v1beta1'
  | 'helmreleases.helm.toolkit.fluxcd.io/v2beta1';

// IAlert is the interface for an alert. An alert in this component can be an error, when the fetchApplication fails or
// an information, which explains a dependency.
export interface IAlert {
  title: string;
  variant: AlertVariant;
}
