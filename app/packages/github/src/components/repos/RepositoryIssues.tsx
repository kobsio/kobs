import { IPluginInstance, ITimes, Pagination, PluginPanel, UseQueryWrapper, formatTimeString } from '@kobsio/core';
import {
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { IssueClosedIcon, IssueOpenedIcon } from '@primer/octicons-react';
import { useQuery } from '@tanstack/react-query';
import { Fragment, FunctionComponent, useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import { AuthContext, IAuthContext } from '../../context/AuthContext';
import { TSearchIssuesAndPullRequests } from '../../utils/utils';

export const RepositoryIssues: FunctionComponent<{
  description?: string;
  instance: IPluginInstance;
  repo: string;
  times: ITimes;
  title: string;
}> = ({ title, description, repo, instance, times }) => {
  const authContext = useContext<IAuthContext>(AuthContext);
  const [options, setOptions] = useState<{ filter: string; page: number; perPage: number }>({
    filter: '',
    page: 1,
    perPage: 10,
  });

  const { isError, isLoading, error, data, refetch } = useQuery<
    { count: number; issues: TSearchIssuesAndPullRequests },
    Error
  >(['github/repo/issues', authContext.organization, instance, times, repo, options], async () => {
    const octokit = authContext.getOctokitClient();
    const result = await octokit.search.issuesAndPullRequests({
      order: 'desc',
      page: options.page,
      per_page: options.perPage,
      q: `repo:${authContext.organization}/${repo} is:issue ${options.filter}`,
      sort: 'updated',
    });
    return { count: result.data.total_count, issues: result.data.items };
  });

  return (
    <PluginPanel
      title={title}
      description={description}
      actions={
        <ToggleButtonGroup
          size="small"
          value={options.filter}
          exclusive={true}
          onChange={(_, value) => setOptions({ ...options, filter: value ?? '', page: 1 })}
        >
          <ToggleButton sx={{ px: 4 }} value="is:open">
            Open
          </ToggleButton>
          <ToggleButton sx={{ px: 4 }} value="is:closed">
            Closed
          </ToggleButton>
          <ToggleButton sx={{ px: 4 }} value="">
            All
          </ToggleButton>
        </ToggleButtonGroup>
      }
    >
      <UseQueryWrapper
        error={error}
        errorTitle="Failed to get issues"
        isError={isError}
        isLoading={isLoading}
        isNoData={!data || data.issues.length === 0}
        noDataTitle="No issues were found"
        refetch={refetch}
      >
        <List disablePadding={true}>
          {data?.issues.map((issue, index) => (
            <Fragment key={issue.id}>
              <ListItem
                sx={{ color: 'inherit', textDecoration: 'inherit' }}
                component={Link}
                to={issue.html_url}
                target="_blank"
              >
                <ListItemText
                  primary={
                    <Typography variant="h6">
                      {issue.closed_at ? (
                        <IssueClosedIcon size={16} fill="#986ee2" />
                      ) : (
                        <IssueOpenedIcon size={16} fill="#57ab5a" />
                      )}
                      <Box component="span" pl={1}>
                        {issue.title}
                      </Box>
                    </Typography>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                  secondary={
                    <>
                      {issue.closed_at
                        ? `#${issue.number} by ${issue.user?.login || '-'} was closed on ${formatTimeString(
                            issue.closed_at,
                          )}`
                        : `#${issue.number} opened on ${formatTimeString(issue.created_at)} by ${
                            issue.user?.login || '-'
                          }`}
                      <Box component="span" pl={2}>
                        {issue.labels.map((label) =>
                          typeof label === 'string' ? (
                            <Chip key={label} sx={{ ml: 2 }} size="small" color="default" label={label} />
                          ) : (
                            <Chip
                              key={label.id}
                              sx={{ backgroundColor: label.color ? `#${label.color}` : undefined, ml: 2 }}
                              size="small"
                              label={label.name}
                            />
                          ),
                        )}
                      </Box>
                    </>
                  }
                />
              </ListItem>
              {index + 1 !== data?.issues.length && <Divider component="li" />}
            </Fragment>
          ))}
        </List>
        <Pagination
          count={data?.count ?? 0}
          page={options.page}
          perPage={options.perPage}
          handleChange={(page, perPage) => setOptions({ ...options, page: page, perPage: perPage })}
        />
      </UseQueryWrapper>
    </PluginPanel>
  );
};
