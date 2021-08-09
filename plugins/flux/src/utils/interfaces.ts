export interface IPanelOptions {
  type?: TType;
  cluster?: string;
  namespace?: string;
  name?: string;
}

// IOptions is the interface for the options which can be set by a user in the Page component for a plugin.
export interface IOptions {
  type: TType;
  cluster: string;
}

export type TType = 'sources' | 'kustomizations' | 'helmreleases';
