// IDashboard is the interface for the Dashboards CR, like it is implemented in the Go code. In contrast to the Go
// implementation we are sure that the cluster, namespace and name for the dashboard is set, because the values are set
// each time a dashboard is retrieved from the Kubernetes API.
export interface IDashboard {
  cluster: string;
  namespace: string;
  name: string;
  title: string;
  description?: string;
  placeholders?: IDashboardPlaceholder[];
  variables?: IDashboardVariable[];
  rows: IDashboardRow[];
}

export interface IDashboardPlaceholder {
  name: string;
  description?: string;
}

export interface IDashboardVariable {
  name: string;
  label?: string;
  hide?: boolean;
  plugin: IDashboardPlugin;
}

export interface IDashboardRow {
  title?: string;
  description?: string;
  size?: number;
  panels: IDashboardPanel[];
}

export interface IDashboardPanel {
  title: string;
  description?: string;
  colSpan?: number;
  rowSpan?: number;
  plugin: IDashboardPlugin;
}

export interface IDashboardPlugin {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
}

// IDashboardReference is the interface for a dashboard reference in the Team or Application CR. If the cluster or
// namespace is not specified in the reference we assume the dashboard is in the same namespace as the team or
// application.
export interface IDashboardReference {
  cluster: string;
  namespace: string;
  name: string;
  title: string;
  description?: string;
  placeholders?: IPlaceholders;
  inline?: IDashboardReferenceInline;
}

export interface IPlaceholders {
  [key: string]: string;
}

export interface IDashboardReferenceInline {
  variables?: IDashboardVariable[];
  rows: IDashboardRow[];
}

// IDashboardVariableValues is an extension of the IDashboardVariable interface. It contains the additional fields for the
// selected variable value and all possible variable values.
export interface IDashboardVariableValues extends IDashboardVariable {
  value: string;
  values: string[];
}
