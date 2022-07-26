import {
  Alert,
  AlertActionLink,
  AlertVariant,
  CardActions,
  DataList,
  Spinner,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React, { useContext, useState } from 'react';

import { AuthContext, IAuthContext } from '../../../context/AuthContext';
import GitHubPagination, { IPage } from '../GitHubPagination';
import { IPluginInstance, PluginPanel } from '@kobsio/shared';
import PullRequest from '../PullRequest';
import { TUserPullRequests } from '../../../utils/interfaces';

const created = 'is:pull-request author:';
const assigned = 'is:pull-request assignee:';
const mentioned = 'is:pull-request mentions:';
const reviewRequests = 'is:pull-request review-requested:';

interface IUserPullRequestsProps {
  title: string;
  description?: string;
  instance: IPluginInstance;
}

const UserPullRequests: React.FunctionComponent<IUserPullRequestsProps> = ({
  title,
  description,
  instance,
}: IUserPullRequestsProps) => {
  const authContext = useContext<IAuthContext>(AuthContext);
  const [page, setPage] = useState<IPage>({ page: 1, perPage: 20 });
  const [query, setQuery] = useState<string>(created);

  const { isError, isLoading, error, data, refetch } = useQuery<TUserPullRequests, Error>(
    ['github/users/pullrequests', authContext.organization, query, instance],
    async () => {
      try {
        const octokit = authContext.getOctokitClient();
        const pullRequests = await octokit.search.issuesAndPullRequests({
          order: 'desc',
          page: 1,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          per_page: 100,
          q: query + authContext.username,
          sort: 'updated',
        });
        return pullRequests.data;
      } catch (err) {
        throw err;
      }
    },
  );

  return (
    <PluginPanel
      title={title}
      description={description}
      actions={
        <CardActions>
          <ToggleGroup aria-label="Type">
            <ToggleGroupItem
              className="pf-u-text-nowrap"
              text="Created"
              isSelected={query === created}
              onChange={(): void => setQuery(created)}
            />
            <ToggleGroupItem
              className="pf-u-text-nowrap"
              text="Assigned"
              isSelected={query === assigned}
              onChange={(): void => setQuery(assigned)}
            />
            <ToggleGroupItem
              className="pf-u-text-nowrap"
              text="Mentioned"
              isSelected={query === mentioned}
              onChange={(): void => setQuery(mentioned)}
            />
            <ToggleGroupItem
              className="pf-u-text-nowrap"
              text="Review Requested"
              isSelected={query === reviewRequests}
              onChange={(): void => setQuery(reviewRequests)}
            />
          </ToggleGroup>
        </CardActions>
      }
      footer={<GitHubPagination itemCount={data?.items.length || 0} page={page} setPage={setPage} />}
    >
      {isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Alert
          variant={AlertVariant.danger}
          isInline={true}
          title="Could not get pull requests"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<TUserPullRequests, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data && data.items ? (
        <DataList aria-label="pull requests" isCompact={true}>
          {data.items.slice((page.page - 1) * page.perPage, page.page * page.perPage).map((pr) => (
            <PullRequest
              key={pr.id}
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
          ))}
        </DataList>
      ) : (
        <div></div>
      )}
    </PluginPanel>
  );
};

export default UserPullRequests;
