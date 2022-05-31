export interface IDashboard {
  id: string;
  satellite: string;
  updatedAt: number;
  cluster: string;
  namespace: string;
  name: string;
  title: string;
  description?: string;
  hideToolbar?: boolean;
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
  satellite: string;
  type: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
}

export interface IReference {
  satellite: string;
  cluster: string;
  namespace: string;
  name: string;
  title: string;
  description?: string;
  placeholders?: IPlaceholders;
  inline?: IReferenceInline;
}

export interface IPlaceholders {
  [key: string]: string;
}

export interface IReferenceInline {
  hideToolbar?: boolean;
  variables?: IVariable[];
  rows: IRow[];
}

export interface IVariableValues extends IVariable {
  value: string;
  values: string[];
}
