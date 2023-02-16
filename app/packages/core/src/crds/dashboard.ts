export interface IDashboard {
  id: string;
  updatedAt: number;
  cluster: string;
  namespace: string;
  name: string;
  title: string;
  description?: string;
  hideToolbar?: boolean;
  placeholders?: IPlaceholder[];
  variables?: IVariable[];
  panels: IPanel[];
}

export interface IPlaceholder {
  name: string;
  description?: string;
  default?: string;
  type?: string;
}

export interface IVariable {
  name: string;
  label?: string;
  hide?: boolean;
  plugin: IPlugin;
}

export interface IPanel {
  title: string;
  description?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  plugin: IPlugin;
}

export interface IPlugin {
  type: string;
  cluster: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
}

export interface IReference {
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
  panels: IPanel[];
}

export interface IVariableValues extends IVariable {
  value: string;
  values: string[];
}
