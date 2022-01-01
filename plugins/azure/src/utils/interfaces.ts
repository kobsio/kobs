// IPanelOptions is the interface for the options property for the Azure panel component.
export interface IPanelOptions {
  type?: string;
  containerinstances?: {
    type?: string;
    resourceGroups?: string[];
    resourceGroup?: string;
    containerGroup?: string;
    containers?: string[];
    metricNames?: string;
    aggregationType?: string;
  };
  costmanagement?: {
    type?: string;
    scope?: string;
  };
  kubernetesservices?: {
    type?: string;
    resourceGroups?: string[];
    resourceGroup?: string;
    managedCluster?: string;
    metricNames?: string;
    aggregationType?: string;
  };
  virtualmachinescalesets?: {
    type?: string;
    resourceGroups?: string[];
    resourceGroup?: string;
    virtualMachineScaleSet?: string;
    virtualMachine?: string;
    metricNames?: string;
    aggregationType?: string;
  };
}

// IMetric is the interface for all metrics returned by Azure.
export interface IMetric {
  id: string;
  type: string;
  name: IMetricName;
  unit: string;
  timeseries: IMetricTimeseries[];
}

export interface IMetricName {
  value: string;
  localizedValue: string;
}

export interface IMetricTimeseries {
  data: IMetricDatum[];
}

export interface IMetricDatum {
  timeStamp: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
