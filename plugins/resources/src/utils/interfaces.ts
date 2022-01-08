import { AlertVariant } from '@patternfly/react-core';

import { IPluginTimes, IResourceColumn } from '@kobsio/plugin-core';

// IOptions is the interface for the options of the page implementation of the resources.plugin.
export interface IOptions {
  clusters: string[];
  namespaces: string[];
  resources: string[];
  selector: string;
  times: IPluginTimes;
}

// IPanelOptions is the interface for the options property in the plugin panel implementation for the resources plugin.
// It contains a list of clusters, namespaces, resources and a selector. Since the data is provided by a user and not
// validated by the Kubernetes API server we have to verify that all required fields are present.
export interface IPanelOptions {
  clusters?: string[];
  namespaces?: string[];
  resources?: string[];
  selector?: string;
  columns?: IResourceColumn[];
}

// IMetric is the interface for the response for a metrics request.
export interface IMetric {
  cluster?: string;
  namespace?: string;
  resources?: IMetricResources;
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

// IAlert is the interface for an alert. An alert in this component can be an error, when the fetchApplication fails or
// an information, which explains a dependency.
export interface IAlert {
  title: string;
  variant: AlertVariant;
}
