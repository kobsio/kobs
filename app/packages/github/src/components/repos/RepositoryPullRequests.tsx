import { IPluginInstance, ITimes, Pagination, PluginPanel, UseQueryWrapper } from '@kobsio/core';
import { Divider, List, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Fragment, FunctionComponent, useContext, useState } from 'react';

import { AuthContext, IAuthContext } from '../../context/AuthContext';
import { TSearchIssuesAndPullRequests } from '../../utils/utils';
import { PullRequest } from '../shared/PullRequest';

export const RepositoryPullRequests: FunctionComponent<{
  description?: string;
  instance: IPluginInstance;
  repo: string;
  times: ITimes;
  title: string;
}> = ({ title, description, repo, instance, times }) => {
  const authContext = useContext<IAuthContext>(AuthContext);
  const [options, setOptions] = useState<{ filter: ''; page: number; perPage: number }>({
    filter: '',
    page: 1,
    perPage: 10,
  });

  const { isError, isLoading, error, data, refetch } = useQuery<
    { count: number; pullRequests: TSearchIssuesAndPullRequests },
    Error
  >(['github/repo/pullrequests', authContext.organization, instance, times, repo, options], async () => {
    const octokit = authContext.getOctokitClient();
    const result = await octokit.search.issuesAndPullRequests({
      order: 'desc',
      page: options.page,
      per_page: options.perPage,
      q: `repo:${authContext.organization}/${repo} is:pull-request ${options.filter}`,
      sort: 'updated',
    });
    return { count: result.data.total_count, pullRequests: result.data.items };
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
        errorTitle="Failed to get pull requests"
        isError={isError}
        isLoading={isLoading}
        isNoData={!data || data.pullRequests.length === 0}
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
