import { TResource } from './interfaces';

export const defaultDescription =
  'A set of continuous and progressive delivery solutions for Kubernetes that are open and extensible.';

export const resources: TResource = {
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
    path: '/apis/source.toolkit.fluxcd.io/v1beta1',
    resource: 'buckets',
    title: 'Buckets',
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
    path: '/apis/source.toolkit.fluxcd.io/v1beta1',
    resource: 'gitrepositories',
    title: 'Git Repositories',
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
    path: '/apis/helm.toolkit.fluxcd.io/v2beta1',
    resource: 'helmreleases',
    title: 'Helm Releases',
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
    path: '/apis/source.toolkit.fluxcd.io/v1beta1',
    resource: 'helmrepositories',
    title: 'Helm Repositories',
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
    path: '/apis/kustomize.toolkit.fluxcd.io/v1beta1',
    resource: 'kustomizations',
    title: 'Kustomizations',
  },
};
