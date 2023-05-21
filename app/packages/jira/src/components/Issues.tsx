import {
  APIContext,
  APIError,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DetailsDrawer,
  IAPIContext,
  IPluginInstance,
  ITimes,
  Pagination,
  PluginPanel,
  UseQueryWrapper,
  pluginBasePath,
} from '@kobsio/core';
import { OpenInNew } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Fragment, FunctionComponent, useContext, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';

import { AuthContext, IAuthContext } from '../context/AuthContext';
import { getStatusColor, jiraToMarkdown } from '../utils/utils';

const IssueDetailsIssueLink: FunctionComponent<{
  instance: IPluginInstance;
  issue: IIssue;
}> = ({ instance, issue }) => {
  return (
    <ListItem
      sx={{
        '.MuiListItemText-root': { paddingRight: '192px' },
        color: 'inherit',
        textDecoration: 'inherit',
      }}
      component={Link}
      to={`${pluginBasePath(instance)}/search?jql=${encodeURIComponent(`key = ${issue.key}`)}`}
      secondaryAction={
        <Stack direction="row" spacing={2} alignItems="center">
          {issue.fields?.priority?.name && issue.fields?.priority?.iconUrl && (
            <Tooltip title={issue.fields?.priority?.name}>
              <Avatar sx={{ height: '14px', width: '14px' }} src={issue.fields?.priority?.iconUrl} alt="" />
            </Tooltip>
          )}
          <Chip
            size="small"
            clickable={true}
            color={getStatusColor(issue.fields?.status?.statusCategory.name)}
            label={issue.fields?.status?.name.toUpperCase()}
          />
          {issue.fields?.assignee?.avatarUrls?.['24x24'] && (
            <Tooltip title={issue.fields?.assignee.displayName}>
              <Avatar
                sx={{ height: '24px', width: '24px' }}
                src={issue.fields?.assignee?.avatarUrls?.['24x24']}
                alt=""
              />
            </Tooltip>
          )}
        </Stack>
      }
    >
      <ListItemAvatar>
        <Avatar
          variant="square"
          sx={{ bgcolor: 'background.paper', color: 'text.primary', height: 24, width: 24 }}
          alt={issue.key}
          src={issue.fields?.issuetype?.iconUrl}
        />
      </ListItemAvatar>
      <ListItemText
        primary={<Typography variant="h6">{issue.key}</Typography>}
        secondary={
          <Typography color="text.secondary" variant="body1">
            {issue.fields?.summary}
          </Typography>
        }
      />
    </ListItem>
  );
};

const IssueDetails: FunctionComponent<{
  instance: IPluginInstance;
  issue: IIssue;
  onClose: () => void;
  open: boolean;
}> = ({ instance, issue, open, onClose }) => {
  const authContext = useContext<IAuthContext>(AuthContext);

  return (
    <DetailsDrawer
      size="large"
      open={open}
      onClose={onClose}
      title={issue.fields?.summary}
      subtitle={`(${issue.key})`}
      actions={
        <IconButton
          edge="end"
          color="inherit"
          sx={{ mr: 1 }}
          component={Link}
          to={`${authContext.url}/browse/${issue.key}`}
          target="_blank"
        >
          <OpenInNew />
        </IconButton>
      }
    >
      <Card sx={{ mb: 6 }}>
        <CardContent>
          <Typography variant="h6" pb={2}>
            Details
          </Typography>
          <DescriptionList>
            {issue.fields?.issuetype?.name && (
              <DescriptionListGroup>
                <DescriptionListTerm>Issue Type</DescriptionListTerm>
                <DescriptionListDescription>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {issue.fields?.issuetype?.iconUrl && (
                      <Avatar
                        variant="square"
                        style={{ height: '24px', width: '24px' }}
                        src={issue.fields?.issuetype?.iconUrl}
                        alt=""
                      />
                    )}
                    <span>{issue.fields?.issuetype?.name || ''}</span>
                  </Stack>
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}

            {issue.fields?.assignee?.displayName && (
              <DescriptionListGroup>
                <DescriptionListTerm>Assignee</DescriptionListTerm>
                <DescriptionListDescription>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {issue.fields?.assignee?.avatarUrls?.['24x24'] && (
                      <Avatar
                        style={{ height: '24px', width: '24px' }}
                        src={issue.fields?.assignee?.avatarUrls?.['24x24']}
                        alt=""
                      />
                    )}
                    <span>{issue.fields?.assignee?.displayName || ''}</span>
                  </Stack>
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}

            {issue.fields?.reporter?.displayName && (
              <DescriptionListGroup>
                <DescriptionListTerm>Reporter</DescriptionListTerm>
                <DescriptionListDescription>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {issue.fields?.reporter?.avatarUrls?.['24x24'] && (
                      <Avatar
                        style={{ height: '24px', width: '24px' }}
                        src={issue.fields?.reporter?.avatarUrls?.['24x24']}
                        alt=""
                      />
                    )}
                    <span>{issue.fields?.reporter?.displayName || ''}</span>
                  </Stack>
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}

            {issue.fields?.status?.name && (
              <DescriptionListGroup>
                <DescriptionListTerm>Status</DescriptionListTerm>
                <DescriptionListDescription>
                  <Chip
                    size="small"
                    color={getStatusColor(issue.fields?.status?.statusCategory.name)}
                    label={issue.fields?.status?.name.toUpperCase()}
                  />
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}

            {issue.fields?.labels && issue.fields?.labels.length > 0 && (
              <DescriptionListGroup>
                <DescriptionListTerm>Labels</DescriptionListTerm>
                <DescriptionListDescription>
                  <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
                    {issue.fields?.labels.map((label) => (
                      <Chip
                        key={label}
                        size="small"
                        color="default"
                        clickable={true}
                        label={label}
                        component={Link}
                        to={`${pluginBasePath(instance)}/search?jql=${encodeURIComponent(`labels = "${label}"`)}`}
                      />
                    ))}
                  </Box>
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}

            {issue.fields?.description && (
              <DescriptionListGroup>
                <DescriptionListTerm>Description</DescriptionListTerm>
                <DescriptionListDescription>
                  <ReactMarkdown linkTarget="_blank">{jiraToMarkdown(issue.fields?.description)}</ReactMarkdown>
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}

            {issue.fields?.parent?.key && (
              <DescriptionListGroup>
                <DescriptionListTerm>Parent</DescriptionListTerm>
                <DescriptionListDescription>
                  <Link
                    to={`${pluginBasePath(instance)}/search?jql=${encodeURIComponent(
                      `key = ${issue.fields?.parent.key}`,
                    )}`}
                  >
                    <div>{issue.fields?.parent.key}</div>
                  </Link>
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}
          </DescriptionList>
        </CardContent>
      </Card>

      {issue.fields?.subtasks && issue.fields?.subtasks.length > 0 && (
        <Card sx={{ mb: 6 }}>
          <CardContent>
            <Typography variant="h6" pb={2}>
              Subtasks
            </Typography>
            <List disablePadding={true}>
              {issue.fields?.subtasks?.map((childIssue, index) => (
                <Fragment key={childIssue.id}>
                  <IssueDetailsIssueLink instance={instance} issue={childIssue} />
                  {index + 1 !== issue.fields?.subtasks?.length && <Divider component="li" />}
                </Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {issue.fields?.issuelinks && issue.fields?.issuelinks.length > 0 && (
        <Card sx={{ mb: 6 }}>
          <CardContent>
            <Typography variant="h6" pb={2}>
              Linked Issues
            </Typography>
            <List disablePadding={true}>
              {issue.fields?.issuelinks?.map((childIssue, index) => (
                <Fragment key={childIssue.id}>
                  {childIssue.inwardIssue ? (
                    <IssueDetailsIssueLink instance={instance} issue={childIssue.inwardIssue} />
                  ) : childIssue.outwardIssue ? (
                    <IssueDetailsIssueLink instance={instance} issue={childIssue.outwardIssue} />
                  ) : (
                    <div></div>
                  )}
                  {index + 1 !== issue.fields?.issuelinks?.length && <Divider component="li" />}
                </Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </DetailsDrawer>
  );
};

const Issue: FunctionComponent<{ instance: IPluginInstance; issue: IIssue }> = ({ instance, issue }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ListItem
        sx={{ '.MuiListItemText-root': { paddingRight: '192px' }, cursor: 'pointer' }}
        onClick={() => setOpen(true)}
        secondaryAction={
          <Stack direction="row" spacing={2} alignItems="center">
            {issue.fields?.priority?.name && issue.fields?.priority?.iconUrl && (
              <Tooltip title={issue.fields?.priority?.name}>
                <Avatar sx={{ height: '14px', width: '14px' }} src={issue.fields?.priority?.iconUrl} alt="" />
              </Tooltip>
            )}
            <Chip
              size="small"
              clickable={true}
              color={getStatusColor(issue.fields?.status?.statusCategory.name)}
              label={issue.fields?.status?.name.toUpperCase()}
            />
            {issue.fields?.assignee?.avatarUrls?.['24x24'] && (
              <Tooltip title={issue.fields?.assignee.displayName}>
                <Avatar
                  sx={{ height: '24px', width: '24px' }}
                  src={issue.fields?.assignee?.avatarUrls?.['24x24']}
                  alt=""
                />
              </Tooltip>
            )}
          </Stack>
        }
      >
        <ListItemAvatar>
          <Avatar
            variant="square"
            sx={{ bgcolor: 'background.paper', color: 'text.primary', height: 24, width: 24 }}
            alt={issue.key}
            src={issue.fields?.issuetype?.iconUrl}
          />
        </ListItemAvatar>
        <ListItemText
          primary={<Typography variant="h6">{issue.key}</Typography>}
          secondary={
            <Typography color="text.secondary" variant="body1">
              {issue.fields?.summary}
            </Typography>
          }
        />
      </ListItem>

      {open && <IssueDetails instance={instance} issue={issue} open={open} onClose={() => setOpen(false)} />}
    </>
  );
};

export const Issues: FunctionComponent<{
  description?: string;
  instance: IPluginInstance;
  jql: string;
  page: { page: number; perPage: number };
  setPage: (page: number, perPage: number) => void;
  times: ITimes;
  title: string;
}> = ({ instance, title, description, jql, page, setPage, times }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<{ issues: IIssue[]; total: number }, APIError>(
    ['jira/projects', instance, jql, page, times],
    async () => {
      return apiContext.client.get<{ issues: IIssue[]; total: number }>(
        `/api/plugins/jira/issues?jql=${encodeURIComponent(jql || '')}&startAt=${page.page - 1}&maxResults=${
          page.perPage
        }`,
        {
          headers: {
            'x-kobs-cluster': instance.cluster,
            'x-kobs-plugin': instance.name,
          },
        },
      );
    },
  );

  return (
    <PluginPanel title={title} description={description}>
      <UseQueryWrapper
        error={error}
        errorTitle="Failed to get issues"
        isError={isError}
        isLoading={isLoading}
        isNoData={!data || !data.issues || data.issues.length === 0}
        noDataTitle="No issues were found"
        refetch={refetch}
      >
        <List disablePadding={true}>
          {data?.issues.map((issue, index) => (
            <Fragment key={issue.id}>
              <Issue instance={instance} issue={issue} />
              {index + 1 !== data?.issues.length && <Divider component="li" />}
            </Fragment>
          ))}
        </List>

        <Pagination
          count={data?.total ?? 0}
          page={page.page ?? 1}
          perPage={page.perPage ?? 10}
          handleChange={setPage}
        />
      </UseQueryWrapper>
    </PluginPanel>
  );
};

export const IssuesWrapper: FunctionComponent<{
  description?: string;
  instance: IPluginInstance;
  jql: string;
  times: ITimes;
  title: string;
}> = ({ instance, title, description, jql, times }) => {
  const [options, setOptions] = useState<{ page: number; perPage: number }>({
    page: 1,
    perPage: 10,
  });

  return (
    <Issues
      title={title}
      description={description}
      instance={instance}
      jql={jql}
      page={options}
      setPage={(page, perPage) => setOptions({ page: page, perPage: perPage })}
      times={times}
    />
  );
};

interface IIssue {
  changelog?: IChangelog;
  expand?: string;
  fields?: IIssueFields;
  id?: string;
  key?: string;
  names?: { [key: string]: string };
  renderedFields?: IIssueRenderedFields;
  self?: string;
  transitions?: ITransition[];
}

interface IIssueFields {
  Creator?: IUser;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Unknowns: any;
  aggregateprogress?: IProgress;
  aggregatetimeestimate?: number;
  aggregatetimeoriginalestimate?: number;
  aggregatetimespent?: number;
  assignee?: IUser;
  attachment?: IAttachment[];
  comment?: IComments;
  components?: IComponent[];
  created?: string;
  description?: string;
  duedate?: string;
  environment?: string;
  epic?: IEpic;
  expand?: string;
  fixVersions?: IFixVersion[];
  issuelinks?: IIssueLink[];
  issuetype?: IIssueType;
  labels?: string[];
  parent?: IParent;
  priority?: IPriority;
  progress?: IProgress;
  project?: IProject;
  reporter?: IUser;
  resolution?: IResolution;
  resolutiondate?: string;
  sprint?: ISprint;
  status?: IStatus;
  subtasks?: ISubtasks[];
  summary?: string;
  timeestimate?: number;
  timeoriginalestimate?: number;
  timespent?: number;
  timetracking?: ITimeTracking;
  updated?: string;
  versions?: IVersion[];
  watches?: IWatches;
  worklog?: IWorklog;
}

interface IIssueType {
  avatarId?: number;
  description?: string;
  iconUrl?: string;
  id?: string;
  name?: string;
  self?: string;
  subtask?: boolean;
}

interface IProject {
  assigneeType?: string;
  avatarUrls?: IAvatarUrls;
  components?: IProjectComponent[];
  description?: string;
  email?: string;
  expand?: string;
  id?: string;
  issueTypes?: IIssueType[];
  key?: string;
  lead?: IUser;
  name?: string;
  projectCategory?: IProjectCategory;
  roles?: { [key: string]: string };
  self?: string;
  url?: string;
  versions?: IVersion[];
}

interface IResolution {
  description: string;
  id: string;
  name: string;
  self: string;
}

interface IPriority {
  description?: string;
  iconUrl?: string;
  id?: string;
  name?: string;
  self?: string;
  statusColor?: string;
}

interface IWatches {
  isWatching?: boolean;
  self?: string;
  watchCount?: number;
  watchers?: IWatcher[];
}

interface IWatcher {
  accountId?: string;
  active?: boolean;
  displayName?: string;
  name?: string;
  self?: string;
}

interface IUser {
  accountId?: string;
  accountType?: string;
  active?: boolean;
  applicationKeys?: string[];
  avatarUrls?: IAvatarUrls;
  displayName?: string;
  emailAddress?: string;
  key?: string;
  locale?: string;
  name?: string;
  self?: string;
  timeZone?: string;
}

interface IAvatarUrls {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '16x16'?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '24x24'?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '32x32'?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '48x48'?: string;
}

interface IComponent {
  description?: string;
  id?: string;
  name?: string;
  self?: string;
}

interface IStatus {
  description: string;
  iconUrl: string;
  id: string;
  name: string;
  self: string;
  statusCategory: IStatusCategory;
}

interface IStatusCategory {
  colorName: string;
  id: number;
  key: string;
  name: string;
  self: string;
}

interface IProgress {
  percent: number;
  progress: number;
  total: number;
}

interface ITimeTracking {
  originalEstimate?: string;
  originalEstimateSeconds?: number;
  remainingEstimate?: string;
  remainingEstimateSeconds?: number;
  timeSpent?: string;
  timeSpentSeconds?: number;
}

interface IWorklog {
  maxResults: number;
  startAt: number;
  total: number;
  worklogs: IWorklogRecord[];
}

interface IWorklogRecord {
  author?: IUser;
  comment?: string;
  created?: string;
  id?: string;
  issueId?: string;
  properties?: IEntityProperty[];
  self?: string;
  started?: string;
  timeSpent?: string;
  timeSpentSeconds?: number;
  updateAuthor?: IUser;
  updated?: string;
}

interface IEntityProperty {
  key: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

interface IFixVersion {
  archived?: boolean;
  description?: string;
  id?: string;
  name?: string;
  projectId?: number;
  releaseDate?: string;
  released?: boolean;
  self?: string;
  startDate?: string;
  userReleaseDate?: string;
}

interface IVersion {
  archived?: boolean;
  description?: string;
  id?: string;
  name?: string;
  projectId?: number;
  releaseDate?: string;
  released?: boolean;
  self?: string;
  startDate?: string;
  userReleaseDate?: string;
}

interface IAttachment {
  author?: IUser;
  content?: string;
  created?: string;
  filename?: string;
  id?: string;
  mimeType?: string;
  self?: string;
  size?: number;
  thumbnail?: string;
}

interface IEpic {
  done: boolean;
  id: number;
  key: string;
  name: string;
  self: string;
  summary: string;
}

interface ISprint {
  completeDate?: string;
  endDate?: string;
  id: number;
  name: string;
  originBoardId: number;
  self: string;
  startDate?: string;
  state: string;
}

interface IParent {
  id?: string;
  key?: string;
}

interface ISubtasks {
  fields: IIssueFields;
  id: string;
  key: string;
  self: string;
}

interface IIssueLink {
  comment?: Comment;
  id?: string;
  inwardIssue?: IIssue;
  outwardIssue?: IIssue;
  self?: string;
  type: IIssueLinkType;
}

interface IIssueLinkType {
  id?: string;
  inward: string;
  name: string;
  outward: string;
  self?: string;
}

interface IComments {
  comments?: IComment[];
}

interface IComment {
  author?: IUser;
  body?: string;
  created?: string;
  id?: string;
  name?: string;
  self?: string;
  updateAuthor?: IUser;
  updated?: string;
  visibility?: ICommentVisibility;
}

interface ICommentVisibility {
  type?: string;
  value?: string;
}

interface IProjectComponent {
  assignee: IUser;
  assigneeType: string;
  description: string;
  id: string;
  isAssigneeTypeValid: boolean;
  lead?: IUser;
  name: string;
  project: string;
  projectId: number;
  realAssignee: IUser;
  realAssigneeType: string;
  self: string;
}

interface IProjectCategory {
  description: string;
  id: string;
  name: string;
  self: string;
}

interface IIssueRenderedFields {
  comment?: IComments;
  created?: string;
  description?: string;
  duedate?: string;
  resolutiondate?: string;
  updated?: string;
}

interface IChangelog {
  histories?: IChangelogHistory[];
}

interface IChangelogHistory {
  author: IUser;
  created: string;
  id: string;
  items: IChangelogItems[];
}

interface IChangelogItems {
  field: string;
  fieldtype: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: any;
  fromString: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  to: any;
  toString: string;
}

interface ITransition {
  fields: { [key: string]: ITransitionField };
  id: string;
  name: string;
  to: IStatus;
}

interface ITransitionField {
  required: boolean;
}

interface IStatus {
  description: string;
  iconUrl: string;
  id: string;
  name: string;
  self: string;
  statusCategory: IStatusCategory;
}

interface IStatusCategory {
  colorName: string;
  id: number;
  key: string;
  name: string;
  self: string;
}
