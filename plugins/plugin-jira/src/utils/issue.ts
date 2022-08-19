export interface IIssue {
  expand?: string;
  id?: string;
  self?: string;
  key?: string;
  fields?: IIssueFields;
  renderedFields?: IIssueRenderedFields;
  changelog?: IChangelog;
  transitions?: ITransition[];
  names?: { [key: string]: string };
}

export interface IIssueFields {
  expand?: string;
  issuetype?: IIssueType;
  project?: IProject;
  environment?: string;
  resolution?: IResolution;
  priority?: IPriority;
  resolutiondate?: string;
  created?: string;
  duedate?: string;
  watches?: IWatches;
  assignee?: IUser;
  updated?: string;
  description?: string;
  summary?: string;
  Creator?: IUser;
  reporter?: IUser;
  components?: IComponent[];
  status?: IStatus;
  progress?: IProgress;
  aggregateprogress?: IProgress;
  timetracking?: ITimeTracking;
  timespent?: number;
  timeestimate?: number;
  timeoriginalestimate?: number;
  worklog?: IWorklog;
  issuelinks?: IIssueLink[];
  comment?: IComments;
  fixVersions?: IFixVersion[];
  versions?: IVersion[];
  labels?: string[];
  subtasks?: ISubtasks[];
  attachment?: IAttachment[];
  epic?: IEpic;
  sprint?: ISprint;
  parent?: IParent;
  aggregatetimeoriginalestimate?: number;
  aggregatetimespent?: number;
  aggregatetimeestimate?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Unknowns: any;
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

export interface IProject {
  expand?: string;
  self?: string;
  id?: string;
  key?: string;
  description?: string;
  lead?: IUser;
  components?: IProjectComponent[];
  issueTypes?: IIssueType[];
  url?: string;
  email?: string;
  assigneeType?: string;
  versions?: IVersion[];
  name?: string;
  roles?: { [key: string]: string };
  avatarUrls?: IAvatarUrls;
  projectCategory?: IProjectCategory;
}

export interface IResolution {
  self: string;
  id: string;
  description: string;
  name: string;
}

export interface IPriority {
  self?: string;
  iconUrl?: string;
  name?: string;
  id?: string;
  statusColor?: string;
  description?: string;
}

export interface IWatches {
  self?: string;
  watchCount?: number;
  isWatching?: boolean;
  watchers?: IWatcher[];
}

export interface IWatcher {
  self?: string;
  name?: string;
  accountId?: string;
  displayName?: string;
  active?: boolean;
}

export interface IUser {
  self?: string;
  accountId?: string;
  accountType?: string;
  name?: string;
  key?: string;
  emailAddress?: string;
  avatarUrls?: IAvatarUrls;
  displayName?: string;
  active?: boolean;
  timeZone?: string;
  locale?: string;
  applicationKeys?: string[];
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

export interface IComponent {
  self?: string;
  id?: string;
  name?: string;
  description?: string;
}

export interface IStatus {
  self: string;
  description: string;
  iconUrl: string;
  name: string;
  id: string;
  statusCategory: IStatusCategory;
}

export interface IStatusCategory {
  self: string;
  id: number;
  name: string;
  key: string;
  colorName: string;
}

export interface IProgress {
  progress: number;
  total: number;
  percent: number;
}

export interface ITimeTracking {
  originalEstimate?: string;
  remainingEstimate?: string;
  timeSpent?: string;
  originalEstimateSeconds?: number;
  remainingEstimateSeconds?: number;
  timeSpentSeconds?: number;
}

export interface IWorklog {
  startAt: number;
  maxResults: number;
  total: number;
  worklogs: IWorklogRecord[];
}

export interface IWorklogRecord {
  self?: string;
  author?: IUser;
  updateAuthor?: IUser;
  comment?: string;
  created?: string;
  updated?: string;
  started?: string;
  timeSpent?: string;
  timeSpentSeconds?: number;
  id?: string;
  issueId?: string;
  properties?: IEntityProperty[];
}

export interface IEntityProperty {
  key: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

export interface IFixVersion {
  self?: string;
  id?: string;
  name?: string;
  description?: string;
  archived?: boolean;
  released?: boolean;
  releaseDate?: string;
  userReleaseDate?: string;
  projectId?: number;
  startDate?: string;
}

export interface IVersion {
  self?: string;
  id?: string;
  name?: string;
  description?: string;
  archived?: boolean;
  released?: boolean;
  releaseDate?: string;
  userReleaseDate?: string;
  projectId?: number;
  startDate?: string;
}

export interface IAttachment {
  self?: string;
  id?: string;
  filename?: string;
  author?: IUser;
  created?: string;
  size?: number;
  mimeType?: string;
  content?: string;
  thumbnail?: string;
}

export interface IEpic {
  id: number;
  key: string;
  self: string;
  name: string;
  summary: string;
  done: boolean;
}

export interface ISprint {
  id: number;
  name: string;
  completeDate?: string;
  endDate?: string;
  startDate?: string;
  originBoardId: number;
  self: string;
  state: string;
}

export interface IParent {
  id?: string;
  key?: string;
}

export interface ISubtasks {
  id: string;
  key: string;
  self: string;
  fields: IIssueFields;
}

export interface IIssueLink {
  id?: string;
  self?: string;
  type: IIssueLinkType;
  outwardIssue?: IIssue;
  inwardIssue?: IIssue;
  comment?: Comment;
}

export interface IIssueLinkType {
  id?: string;
  self?: string;
  name: string;
  inward: string;
  outward: string;
}

export interface IComments {
  comments?: IComment[];
}

export interface IComment {
  id?: string;
  self?: string;
  name?: string;
  author?: IUser;
  body?: string;
  updateAuthor?: IUser;
  updated?: string;
  created?: string;
  visibility?: ICommentVisibility;
}

export interface ICommentVisibility {
  type?: string;
  value?: string;
}

export interface IProjectComponent {
  self: string;
  id: string;
  name: string;
  description: string;
  lead?: IUser;
  assigneeType: string;
  assignee: IUser;
  realAssigneeType: string;
  realAssignee: IUser;
  isAssigneeTypeValid: boolean;
  project: string;
  projectId: number;
}

export interface IProjectCategory {
  self: string;
  id: string;
  name: string;
  description: string;
}

export interface IIssueRenderedFields {
  resolutiondate?: string;
  created?: string;
  duedate?: string;
  updated?: string;
  comment?: IComments;
  description?: string;
}

export interface IChangelog {
  histories?: IChangelogHistory[];
}

export interface IChangelogHistory {
  id: string;
  author: IUser;
  created: string;
  items: IChangelogItems[];
}

export interface IChangelogItems {
  field: string;
  fieldtype: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: any;
  fromString: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  to: any;
  toString: string;
}

export interface ITransition {
  id: string;
  name: string;
  to: IStatus;
  fields: { [key: string]: ITransitionField };
}

export interface ITransitionField {
  required: boolean;
}

export interface IStatus {
  self: string;
  description: string;
  iconUrl: string;
  name: string;
  id: string;
  statusCategory: IStatusCategory;
}

export interface IStatusCategory {
  self: string;
  id: number;
  name: string;
  key: string;
  colorName: string;
}
