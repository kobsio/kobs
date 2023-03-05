import { V1LabelSelector, V1Pod } from '@kubernetes/client-node';

import { IReference } from '../../crds/dashboard';

/**
 * `IOptions` is the interface for all the options which can be set in the resources plugin. These are the `clusters`,
 * `namespaces`, `resources` and some other parameters.
 */
export interface IOptions {
  clusters?: string[];
  columns?: IOptionsColumn[];
  filter?: string;
  namespaces?: string[];
  param?: string;
  paramName?: string;
  resources?: string[];
}

/**
 * `IOptionsColumn` is the interface which must be implemented by a custom column in the resources table. To get the
 * value which should be shown in the table we need a `jsonPath`, the `resource` for which this column should be used,
 * the `title` of the column and a `type` to apply a custom formatter.
 */
export interface IOptionsColumn {
  jsonPath?: string;
  resource?: string;
  title?: string;
  type?: string;
}

/**
 * `IResource`
 */
export interface IResource {
  columns: ICRDColumn[];
  description: string;
  id: string;
  isCRD: boolean;
  path: string;
  resource: string;
  scope: string;
  title: string;
}

/**
 * `ICRDColumn`
 */
export interface ICRDColumn {
  description: string;
  jsonPath: string;
  name: string;
  type: string;
}

/**
 * `IResourceResponse` is the interface for the response of our API for a get resources call.
 */
export interface IResourceResponse {
  clusters?: IResourceResponseCluster[];
  dashboards?: IDashboard[];
  error?: string;
  resource: IResource;
}

export interface IResourceResponseCluster {
  cluster?: string;
  error?: string;
  namespaces?: IResourceResponseNamespace[];
}

export interface IResourceResponseNamespace {
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manifest?: any;
  namespace?: string;
}

export interface IDashboard {
  dashboard?: IReference;
  labels?: { [key: string]: string };
  resource?: string;
}

/**
 * `getLabelSelector` returns the given label selector as `string`, so that it can be used within our UI.
 */
export const getLabelSelector = (labelSelector: V1LabelSelector | undefined): string => {
  if (!labelSelector) {
    return '';
  }

  if (labelSelector.matchLabels) {
    return Object.keys(labelSelector.matchLabels)
      .map(
        (key) =>
          `${key}=${
            labelSelector.matchLabels && key in labelSelector.matchLabels ? labelSelector.matchLabels[key] : ''
          }`,
      )
      .join(', ');
  }

  return '';
};

/**
 * `getSelector` is used to get the label selector for various resources as string. The returned string can be used in
 * a Kubernetes API request to get the all pods, which are matching the label selector.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getSelector = (resource: IResource, manifest: any): string => {
  if (
    resource.id === 'deployments' ||
    resource.id === 'daemonsets' ||
    resource.id === 'statefulsets' ||
    resource.id === 'jobs'
  ) {
    return manifest?.spec?.selector?.matchLabels
      ? Object.keys(manifest.spec.selector.matchLabels)
          .map((key) => `${key}=${manifest.spec.selector.matchLabels[key]}`)
          .join(',')
      : '';
  }

  return '';
};

/**
 * `getDashboards` returns all dashboards for a resource. This includes all references from the configured integration
 * and the references from the "kobs.io/dashboards" annotation on a resource.
 */
export const getDashboards = (
  cluster: string,
  namespace: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manifest: any,
  dashboards?: IDashboard[],
): IReference[] => {
  // Get dashboard references from the integrations. For that we loop through all configured dashboards from the
  // integrations. If a dashboard is defined we check if the user also defined some labels. If this is the case we check
  // that the resource matches the configured labels to only add the these dashboards. If the user did not defined any
  // labels we add all dashboards.
  const integrationReferences: IReference[] = [];
  if (dashboards) {
    for (const dashboard of dashboards) {
      if (dashboard.dashboard) {
        if (dashboard.labels) {
          if (manifest?.metadata?.labels) {
            for (const [key, value] of Object.entries(dashboard.labels)) {
              if (key in manifest?.metadata.labels && manifest?.metadata.labels[key] === value) {
                integrationReferences.push(dashboard.dashboard);
              }
            }
          }
        } else {
          integrationReferences.push(dashboard.dashboard);
        }
      }
    }

    for (let i = 0; i < integrationReferences.length; i++) {
      if (!integrationReferences[i].cluster || integrationReferences[i].cluster === '') {
        integrationReferences[i].cluster = cluster;
      }
      if (!integrationReferences[i].namespace || integrationReferences[i].namespace === '') {
        integrationReferences[i].namespace = namespace;
      }
    }
  }

  // Get dashboard references from the "kobs.io/dashboards" annotation.
  const referencesAnnotation =
    manifest &&
    manifest.metadata &&
    manifest.metadata.annotations &&
    'kobs.io/dashboards' in manifest?.metadata.annotations
      ? manifest?.metadata.annotations['kobs.io/dashboards']
      : undefined;

  if (!referencesAnnotation) {
    return integrationReferences;
  }

  try {
    const references: IReference[] = JSON.parse(referencesAnnotation);

    for (let i = 0; i < references.length; i++) {
      if (!references[i].cluster || references[i].cluster === '') {
        references[i].cluster = cluster;
      }
      if (!references[i].namespace || references[i].namespace === '') {
        references[i].namespace = namespace;
      }
    }

    return [...integrationReferences, ...references];
  } catch (err) {
    return integrationReferences;
  }
};

/**
 * `formatResourceValue` converts the given value for CPU, memory or ephemeral storage to another unit, so we have a
 * nicer way to display these values.
 */
export const formatResourceValue = (type: string, value: string): string => {
  if (value === '' || value === undefined) {
    return '';
  }

  if (type === 'cpu') {
    if (value.slice(-1) === 'm') {
      return value;
    }

    if (value.slice(-1) === 'n') {
      return Math.round(parseInt(value.slice(0, -1)) / 1000000) + 'm';
    }

    return parseInt(value) * 1000 + 'm';
  }

  if (type === 'memory') {
    if (value.slice(-2) === 'Ki') {
      return Math.round(parseInt(value.slice(0, -2)) / 1024) + 'Mi';
    }

    if (value.slice(-2) === 'Mi') {
      return value;
    }

    if (value.slice(-2) === 'Gi') {
      return Math.round(parseInt(value.slice(0, -2)) * 1024) + 'Mi';
    }

    return value;
  }

  if (type === 'ephemeral-storage') {
    if (value.slice(-2) === 'Ki') {
      return Math.round(parseInt(value.slice(0, -2)) / 1024 / 1024) + 'Gi';
    }

    if (value.slice(-2) === 'Mi') {
      return Math.round(parseInt(value.slice(0, -2)) / 1024) + 'Gi';
    }

    if (value.slice(-2) === 'Gi') {
      return value;
    }

    return Math.round(parseInt(value) / 1024 / 1024 / 1024) + 'Gi';
  }

  return value;
};

/**
 * `getContainers` returns a list with all container names for the given Pod. It contains the init containers, containers
 * and ephemeral containers.
 */
export const getContainers = (pod: V1Pod): string[] => {
  const containers: string[] = [];

  if (pod.spec?.initContainers) {
    for (const container of pod.spec.initContainers) {
      containers.push(container.name);
    }
  }

  if (pod.spec?.containers) {
    for (const container of pod.spec.containers) {
      containers.push(container.name);
    }
  }

  if (pod.spec?.ephemeralContainers) {
    for (const container of pod.spec.ephemeralContainers) {
      containers.push(container.name);
    }
  }

  return containers;
};
