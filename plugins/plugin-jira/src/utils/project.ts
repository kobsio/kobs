export interface IProject {
  expand: string;
  self: string;
  id: string;
  key: string;
  name: string;
  avatarUrls: IAvatarUrls;
  projectTypeKey: string;
  projectCategory?: IProjectCategory;
  issueTypes?: IIssueType[];
}

export interface IAvatarUrls {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '16x16'?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '24x24'?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '32x32'?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '48x48'?: string;
}

export interface IProjectCategory {
  self: string;
  id: string;
  name: string;
  description: string;
}

export interface IIssueType {
  self?: string;
  id?: string;
  description?: string;
  iconUrl?: string;
  name?: string;
  subtask?: boolean;
  avatarId?: number;
}
