export const description =
  "Query, visualize, alert on, and understand your data no matter where it's stored. With Grafana you can create, explore and share all of your data through beautiful, flexible dashboards.";

/**
 * `IDashboard` is the interface of a single dashboard.
 */
export interface IDashboard {
  folderId: number;
  folderTitle?: string;
  folderUid: string;
  folderUrl?: string;
  id: number;
  tags: string[];
  title: string;
  type?: string;
  uid: string;
  url: string;
}
