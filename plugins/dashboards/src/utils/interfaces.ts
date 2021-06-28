export interface IDashboard {
  cluster: string;
  namespace: string;
  name: string;
  title: string;
  description?: string;
  placeholders?: IPlaceholder[];
  rows: IRow[];
}

export interface IPlaceholder {
  name: string;
  description?: string;
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

export interface IReference {
  cluster?: string;
  namespace?: string;
  name: string;
  title: string;
  description?: string;
  placeholders?: IPlaceholders;
}

export interface IPlaceholders {
  [key: string]: string;
}
