// IPanelOptions is the interface for the options property for the Azure panel component.
export interface IPanelOptions {
  type?: string;
  containerinstances?: {
    type?: string;
    resourceGroup?: string;
    containerGroup?: string;
    containers?: string[];
    metric?: string;
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
  average?: number;
}
