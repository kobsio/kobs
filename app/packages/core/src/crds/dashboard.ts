export interface IDashboard {
  cluster: string;
  description?: string;
  hideToolbar?: boolean;
  id: string;
  name: string;
  namespace: string;
  panels: IPanel[];
  placeholders?: IPlaceholder[];
  title: string;
  updatedAt: number;
  variables?: IVariable[];
}

export interface IPlaceholder {
  default?: string;
  description?: string;
  name: string;
  type?: string;
}

export interface IVariable {
  hide?: boolean;
  label?: string;
  name: string;
  plugin: IPlugin;
}

export interface IPanel {
  description?: string;
  h?: number;
  plugin: IPlugin;
  title: string;
  w?: number;
  x?: number;
  y?: number;
}

export interface IPlugin {
  cluster: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
  type: string;
}

export interface IReference {
  cluster: string;
  description?: string;
  inline?: IReferenceInline;
  name: string;
  namespace: string;
  placeholders?: IPlaceholders;
  title: string;
}

export interface IPlaceholders {
  [key: string]: string;
}

export interface IReferenceInline {
  hideToolbar?: boolean;
  panels: IPanel[];
  variables?: IVariable[];
}

export interface IVariableValues extends IVariable {
  value: string;
  values: string[];
}
