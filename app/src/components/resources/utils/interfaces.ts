import { AlertVariant } from '@patternfly/react-core';

import { IResource } from '../../../resources/clusters';
import { ITimes } from '@kobsio/shared';

export interface IOptions {
  clusterIDs: string[];
  namespaceIDs: string[];
  resourceIDs: string[];
  param: string;
  paramName: string;
  columns?: IColumn[];
  times: ITimes;
}

export interface IColumn {
  title?: string;
  resource?: string;
  jsonPath?: string;
  type?: string;
}

export interface IResourceResponse {
  resource: IResource;
  resourceLists: IResourceList[];
  errors: string[];
}

export interface IResourceList {
  satellite: string;
  cluster: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  list: any;
}

// IAlert is the interface for an alert. An alert in this component can be an error, when the fetchApplication fails or
// an information, which explains a dependency.
export interface IAlert {
  title: string;
  variant: AlertVariant;
}

// IMetric is the interface for the response for a metrics request.
export interface IMetric {
  satellite?: string;
  namespace?: string;
  list?: IMetricResources;
}

export interface IMetricResources {
  apiVersion?: string;
  containers?: IMetricContainer[];
  kind?: string;
  timestamp?: Date;
  usage?: IMetricUsage;
  window?: string;
}

export interface IMetricContainer {
  name?: string;
  usage?: IMetricUsage;
}

export interface IMetricUsage {
  cpu?: string;
  memory?: string;
}
