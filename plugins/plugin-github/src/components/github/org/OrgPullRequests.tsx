import { Alert, AlertActionLink, AlertVariant, DataList, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React, { useContext, useState } from 'react';

import { AuthContext, IAuthContext } from '../../../context/AuthContext';
import GitHubPagination, { IPage } from '../GitHubPagination';
import { IPluginInstance, PluginPanel } from '@kobsio/shared';
import PullRequest from '../PullRequest';
import { TOrgPullRequests } from '../../../utils/interfaces';

interface IOrgPullRequestsProps {
  title: string;
  description?: string;
  instance: IPluginInstance;
}

const OrgPullRequests: React.FunctionComponent<IOrgPullRequestsProps> = ({
  title,
  description,
  instance,
}: IOrgPullRequestsProps) => {
  const authContext = useContext<IAuthContext>(AuthContext);
  const [page, setPage] = useState<IPage>({ page: 1, perPage: 20 });

  const { isError, isLoading, error, data, refetch } = useQuery<TOrgPullRequests, Error>(
    ['github/org/pullrequests', authContext.organization, instance],
    async () => {
      try {
        const octokit = authContext.getOctokitClient();
        const pullRequests = await octokit.search.issuesAndPullRequests({
          order: 'desc',
          page: 1,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          per_page: 100,
          q: `org:${authContext.organization} is:pull-request`,
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
          title="Could not get organization pull requests"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<TOrgPullRequests, Error>> => refetch()}>
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

export default OrgPullRequests;
