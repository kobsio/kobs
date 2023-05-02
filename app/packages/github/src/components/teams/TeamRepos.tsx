import { IPluginInstance, ITimes, PluginPanel, UseQueryWrapper } from '@kobsio/core';
import { Button, Divider, List } from '@mui/material';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Fragment, FunctionComponent, useContext } from 'react';

import { AuthContext, IAuthContext } from '../../context/AuthContext';
import { TTeamRepos } from '../../utils/utils';
import { Repository } from '../shared/Repository';

const reposPerPage = 10;

export const TeamRepos: FunctionComponent<{
  description?: string;
  instance: IPluginInstance;
  slug: string;
  times: ITimes;
  title: string;
}> = ({ title, description, slug, instance, times }) => {
  const authContext = useContext<IAuthContext>(AuthContext);

  const fetchRepos = async (page = 1) => {
    const octokit = authContext.getOctokitClient();
    const repos = await octokit.teams.listReposInOrg({
      org: authContext.organization,
      page: page,
      per_page: reposPerPage,
      team_slug: slug,
    });
    return repos.data;
  };

  const { isLoading, isError, data, error, refetch, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery<
    TTeamRepos,
    Error
  >(
    ['github/team/repos', authContext.organization, slug, instance, times],
    ({ pageParam = 1 }) => fetchRepos(pageParam),
    {
      getNextPageParam: (lastPage, allPages) => (lastPage.length < reposPerPage ? undefined : allPages.length + 1),
    },
  );

  return (
    <PluginPanel title={title} description={description}>
      <UseQueryWrapper
        error={error}
        errorTitle="Failed to get teams"
        isError={isError}
        isLoading={isLoading}
        isNoData={!data || data.pages.length === 0 || data.pages[0].length === 0}
        noDataTitle="No teams were found"
        refetch={refetch}
      >
        <List disablePadding={true}>
          {data?.pages.map((page, pageIndex) =>
            page.map((repo, repoIndex) => (
              <Fragment key={repo.id}>
                <Repository
                  instance={instance}
                  name={repo.name}
                  description={repo.description}
                  language={repo.language}
                  stargazersCount={repo.stargazers_count}
                  forksCount={repo.forks_count}
                  openIssuesCount={repo.open_issues_count}
                  pushedAt={repo.pushed_at}
                  times={times}
                />
                {pageIndex + 1 === data?.pages.length &&
                repoIndex + 1 === data?.pages[data.pages.length - 1].length ? null : (
                  <Divider component="li" />
                )}
              </Fragment>
            )),
          )}
        </List>
        {hasNextPage && (
          <Button variant="text" fullWidth={true} disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
            Load More
          </Button>
        )}
      </UseQueryWrapper>
    </PluginPanel>
  );
};
