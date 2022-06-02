// IOptions is the interface for the options on the Grafana page.
export interface IOptions {
  query: string;
}

export interface IPanelOptions {
  type?: string;
  dashboards?: string[];
  panel?: IGrafanaPanelOptions;
}

export interface IGrafanaPanelOptions {
  dashboardID?: string;
  panelID?: string;
  variables?: IGrafanaPanelVariables;
}

export interface IGrafanaPanelVariables {
  [key: string]: string;
}

// IDashboard is the interface of a single dashboard.
export interface IDashboard {
  id: number;
  uid: string;
  title: string;
  url: string;
  type?: string;
  tags: string[];
  folderId: number;
  folderUid: string;
  folderTitle?: string;
  folderUrl?: string;
}
