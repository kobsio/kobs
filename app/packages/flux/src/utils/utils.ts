export const description =
  'A set of continuous and progressive delivery solutions for Kubernetes that are open and extensible.';

/**
 * `TFluxType` is the type for the Flux resources we are supporting within the plugin.
 */
export type TFluxType = 'gitrepositories' | 'helmrepositories' | 'buckets' | 'kustomizations' | 'helmreleases';

/**
 * `IFluxResource` is the interface which must be implemented by a Flux resource. Each resource must contain a list of
 * `columns` we want to show in the UI, The `resource` name under which we can find the CRD, a `title` and the `type`
 * from the `TFluxType` list.
 */
export interface IFluxResource {
  columns: IFluxResourceColumn[];
  resource: string;
  title: string;
  type: TFluxType;
}

export interface IFluxResourceColumn {
  jsonPath: string;
  title: string;
  type: string;
}

/**
 * `fluxResources` implements the `IFluxResource` interface for all `TFluxType`s.
 */
export const fluxResources: Record<TFluxType, IFluxResource> = {
  buckets: {
    columns: [
      {
        jsonPath: '$.spec.endpoint',
        title: 'Endpoint',
        type: 'string',
      },
      {
        jsonPath: '$.status.conditions[?(@.type=="Ready")].status',
        title: 'Ready',
        type: 'string',
      },
      {
        jsonPath: '$.spec.suspend',
        title: 'Suspended',
        type: 'boolean',
      },
      {
        jsonPath: '$.status.conditions[?(@.type=="Ready")].message',
        title: 'Status',
        type: 'string',
      },
      {
        jsonPath: '$.metadata.creationTimestamp',
        title: 'Age',
        type: 'date',
      },
    ],
    resource: 'buckets.source.toolkit.fluxcd.io',
    title: 'Buckets',
    type: 'buckets',
  },
  gitrepositories: {
    columns: [
      {
        jsonPath: '$.spec.url',
        title: 'URL',
        type: 'string',
      },
      {
        jsonPath: '$.status.conditions[?(@.type=="Ready")].status',
        title: 'Ready',
        type: 'string',
      },
      {
        jsonPath: '$.spec.suspend',
        title: 'Suspended',
        type: 'boolean',
      },
      {
        jsonPath: '$.status.conditions[?(@.type=="Ready")].message',
        title: 'Status',
        type: 'string',
      },
      {
        jsonPath: '$.metadata.creationTimestamp',
        title: 'Age',
        type: 'date',
      },
    ],
    resource: 'gitrepositories.source.toolkit.fluxcd.io',
    title: 'Git Repositories',
    type: 'gitrepositories',
  },
  helmreleases: {
    columns: [
      {
        jsonPath: '$.status.conditions[?(@.type=="Ready")].status',
        title: 'Ready',
        type: 'string',
      },
      {
        jsonPath: '$.spec.suspend',
        title: 'Suspended',
        type: 'boolean',
      },
      {
        jsonPath: '$.status.conditions[?(@.type=="Ready")].message',
        title: 'Status',
        type: 'string',
      },
      {
        jsonPath: '$.metadata.creationTimestamp',
        title: 'Age',
        type: 'date',
      },
    ],
    resource: 'helmreleases.helm.toolkit.fluxcd.io',
    title: 'Helm Releases',
    type: 'helmreleases',
  },
  helmrepositories: {
    columns: [
      {
        jsonPath: '$.spec.url',
        title: 'URL',
        type: 'string',
      },
      {
        jsonPath: '$.status.conditions[?(@.type=="Ready")].status',
        title: 'Ready',
        type: 'string',
      },
      {
        jsonPath: '$.spec.suspend',
        title: 'Suspended',
        type: 'boolean',
      },
      {
        jsonPath: '$.status.conditions[?(@.type=="Ready")].message',
        title: 'Status',
        type: 'string',
      },
      {
        jsonPath: '$.metadata.creationTimestamp',
        title: 'Age',
        type: 'date',
      },
    ],
    resource: 'helmrepositories.source.toolkit.fluxcd.io',
    title: 'Helm Repositories',
    type: 'helmrepositories',
  },

  kustomizations: {
    columns: [
      {
        jsonPath: '$.status.conditions[?(@.type=="Ready")].status',
        title: 'Ready',
        type: 'string',
      },
      {
        jsonPath: '$.spec.suspend',
        title: 'Suspended',
        type: 'boolean',
      },
      {
        jsonPath: '$.status.conditions[?(@.type=="Ready")].message',
        title: 'Status',
        type: 'string',
      },
      {
        jsonPath: '$.metadata.creationTimestamp',
        title: 'Age',
        type: 'date',
      },
    ],
    resource: 'kustomizations.kustomize.toolkit.fluxcd.io',
    title: 'Kustomizations',
    type: 'kustomizations',
  },
};
