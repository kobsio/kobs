import { IPluginInstance, ITimes, Pagination, PluginPanel, UseQueryWrapper } from '@kobsio/core';
import { Divider, List, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Fragment, FunctionComponent, useContext, useState } from 'react';

import { AuthContext, IAuthContext } from '../../context/AuthContext';
import { TSearchIssuesAndPullRequests } from '../../utils/utils';
import { PullRequest } from '../shared/PullRequest';

export const UserPullRequests: FunctionComponent<{
  description?: string;
  instance: IPluginInstance;
  times: ITimes;
  title: string;
}> = ({ title, description, instance, times }) => {
  const authContext = useContext<IAuthContext>(AuthContext);
  const [options, setOptions] = useState<{ filter: string; page: number; perPage: number }>({
    filter: 'author',
    page: 1,
    perPage: 10,
  });

  const { isError, isLoading, error, data, refetch } = useQuery<
    { count: number; pullRequests: TSearchIssuesAndPullRequests },
    Error
  >(
    ['github/users/pullrequests', authContext.organization, authContext.username, instance, times, options],
    async () => {
      const octokit = authContext.getOctokitClient();
      const result = await octokit.search.issuesAndPullRequests({
        order: 'desc',
        page: options.page,
        per_page: options.perPage,
        q: `is:pull-request ${options.filter}:${authContext.username}`,
        sort: 'updated',
      });
      return { count: result.data.total_count, pullRequests: result.data.items };
    },
  );

  return (
    <PluginPanel
      title={title}
      description={description}
      actions={
        <ToggleButtonGroup
          size="small"
          value={options.filter}
          exclusive={true}
          onChange={(_, value) => setOptions({ ...options, filter: value ?? 'author', page: 1 })}
        >
          <ToggleButton sx={{ px: 4 }} value="author">
            Created
          </ToggleButton>
          <ToggleButton sx={{ px: 4 }} value="assignee">
            Assigned
          </ToggleButton>
          <ToggleButton sx={{ px: 4 }} value="mentions">
            Mentioned
          </ToggleButton>
          <ToggleButton sx={{ px: 4 }} value="review-requested">
            Review Requested
          </ToggleButton>
        </ToggleButtonGroup>
      }
    >
      <UseQueryWrapper
        error={error}
        errorTitle="Failed to get pull requests"
        isError={isError}
        isLoading={isLoading}
        isNoData={!data || !data.pullRequests || data.pullRequests.length === 0}
        noDataTitle="No pull requests were found"
        refetch={refetch}
      >
        <List disablePadding={true}>
          {data?.pullRequests.map((pr, index) => (
            <Fragment key={pr.id}>
              <PullRequest
                title={pr.title}
                url={pr.html_url}
                number={pr.number}
                user={pr.user?.login}
                state={pr.state}
                draft={pr.draft}
                createdAt={pr.created_at}
                closedAt={pr.closed_at}
                mergedAt={pr.pull_request?.merged_at}
                labels={pr.labels}
              />
              {index + 1 !== data?.pullRequests.length && <Divider component="li" />}
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
