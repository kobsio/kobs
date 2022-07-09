export interface INavigationGroup {
  title: string;
  items: INavigationItem[];
}

export interface INavigationItem {
  title: string;
  childs: INavigationItem[];
  dashboard: IDashboard;
}

export interface IDashboard {
  satellite: string;
  cluster: string;
  namespace: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  placeholders?: { [key: string]: any };
}
