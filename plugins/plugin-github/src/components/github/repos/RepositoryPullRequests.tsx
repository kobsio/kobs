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
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useContext, useState } from 'react';

import { AuthContext, IAuthContext } from '../../../context/AuthContext';
import GitHubPagination, { IPage } from '../GitHubPagination';
import { IPluginInstance, PluginPanel } from '@kobsio/shared';
import PullRequest from '../PullRequest';
import { TRepositoryPullRequests } from '../../../utils/interfaces';

interface IRepositoryPullRequestsProps {
  title: string;
  description?: string;
  repo: string;
  instance: IPluginInstance;
}

const RepositoryPullRequests: React.FunctionComponent<IRepositoryPullRequestsProps> = ({
  title,
  description,
  repo,
  instance,
}: IRepositoryPullRequestsProps) => {
  const authContext = useContext<IAuthContext>(AuthContext);
  const [page, setPage] = useState<IPage>({ page: 1, perPage: 20 });
  const [state, setState] = useState<'open' | 'closed' | 'all'>('open');

  const { isError, isLoading, error, data, refetch } = useQuery<TRepositoryPullRequests, Error>(
    ['github/team/pullrequests', authContext.organization, repo, state, instance],
    async () => {
      try {
        const octokit = authContext.getOctokitClient();
        const pullRequests = await octokit.pulls.list({
          owner: authContext.organization,
          page: 1,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          per_page: 100,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          repo: repo,
          state: state,
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
              text="Open"
              isSelected={state === 'open'}
              onChange={(): void => setState('open')}
            />
            <ToggleGroupItem
              className="pf-u-text-nowrap"
              text="Closed"
              isSelected={state === 'closed'}
              onChange={(): void => setState('closed')}
            />
            <ToggleGroupItem
              className="pf-u-text-nowrap"
              text="All"
              isSelected={state === 'all'}
              onChange={(): void => setState('all')}
            />
          </ToggleGroup>
        </CardActions>
      }
      footer={<GitHubPagination itemCount={data?.length || 0} page={page} setPage={setPage} />}
    >
      {isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Alert
          variant={AlertVariant.danger}
          isInline={true}
          title="Could not get repository pull requests"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<TRepositoryPullRequests, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data ? (
        <DataList aria-label="pull requests" isCompact={true}>
          {data.slice((page.page - 1) * page.perPage, page.page * page.perPage).map((pr) => (
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
              mergedAt={pr.merged_at}
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

export default RepositoryPullRequests;
