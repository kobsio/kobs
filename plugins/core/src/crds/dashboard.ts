// IDashboard is the interface for the Dashboards CR, like it is implemented in the Go code. In contrast to the Go
// implementation we are sure that the cluster, namespace and name for the dashboard is set, because the values are set
// each time a dashboard is retrieved from the Kubernetes API.
export interface IDashboard {
  cluster: string;
  namespace: string;
  name: string;
  title: string;
  description?: string;
  placeholders?: IPlaceholder[];
  variables?: IVariable[];
  rows: IRow[];
}

export interface IPlaceholder {
  name: string;
  description?: string;
}

export interface IVariable {
  name: string;
  label?: string;
  hide?: boolean;
  plugin: IPlugin;
}

export interface IRow {
  title?: string;
  description?: string;
  size?: number;
  panels: IPanel[];
}

export interface IPanel {
  title: string;
  description?: string;
  colSpan?: number;
  rowSpan?: number;
  plugin: IPlugin;
}

export interface IPlugin {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
}

// IReference is the interface for a dashboard reference in the Team or Application CR. If the cluster or namespace is
// not specified in the reference we assume the dashboard is in the same namespace as the team or application.
export interface IReference {
  cluster?: string;
  namespace?: string;
  name?: string;
  title: string;
  description?: string;
  placeholders?: IPlaceholders;
  inline?: IReferenceInline;
}

export interface IPlaceholders {
  [key: string]: string;
}

export interface IReferenceInline {
  variables?: IVariable[];
  rows: IRow[];
}
