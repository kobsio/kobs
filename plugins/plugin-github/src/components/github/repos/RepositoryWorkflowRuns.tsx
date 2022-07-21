import {
  Alert,
  AlertActionLink,
  AlertVariant,
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Flex,
  FlexItem,
  Spinner,
} from '@patternfly/react-core';
import { CheckCircleFillIcon, DotFillIcon, DotIcon, XCircleFillIcon } from '@primer/octicons-react';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useContext, useState } from 'react';

import { AuthContext, IAuthContext } from '../../../context/AuthContext';
import GitHubPagination, { IPage } from '../GitHubPagination';
import { IPluginInstance, PluginPanel } from '@kobsio/shared';
import RepositoryWorkflowRunsDetails from './RepositoryWorkflowRunsDetails';
import { TRepositoryWorkflowRuns } from '../../../utils/interfaces';

interface IRepositoryWorkflowRunsProps {
  title: string;
  description?: string;
  repo: string;
  instance: IPluginInstance;
  setDetails?: (details: React.ReactNode) => void;
}

const RepositoryWorkflowRuns: React.FunctionComponent<IRepositoryWorkflowRunsProps> = ({
  title,
  description,
  repo,
  instance,
  setDetails,
}: IRepositoryWorkflowRunsProps) => {
  const authContext = useContext<IAuthContext>(AuthContext);
  const [page, setPage] = useState<IPage>({ page: 1, perPage: 20 });

  const { isError, isLoading, error, data, refetch } = useQuery<TRepositoryWorkflowRuns, Error>(
    ['github/team/workflowruns', authContext.organization, repo, instance],
    async () => {
      try {
        const octokit = authContext.getOctokitClient();
        const workflowRuns = await octokit.actions.listWorkflowRunsForRepo({
          owner: authContext.organization,
          page: 1,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          per_page: 100,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          repo: repo,
        });
        return workflowRuns.data;
      } catch (err) {
        throw err;
      }
    },
  );

  const selectWorkflowRun = (id: string): void => {
    if (setDetails) {
      const run = data?.workflow_runs.filter((run) => run.id === parseInt(id));
      if (run && run.length === 1) {
        setDetails(
          <RepositoryWorkflowRunsDetails
            repo={repo}
            id={run[0].id}
            attempt={run[0].run_attempt || 1}
            url={run[0].html_url}
            branch={run[0].head_branch || '-'}
            message={run[0].head_commit?.message.split('\n')[0] || '-'}
            author={`${run[0].head_commit?.author?.name} (${run[0].head_commit?.author?.email})`}
            status={run[0].status || '-'}
            conclusion={run[0].conclusion || '-'}
            instance={instance}
            close={(): void => setDetails(undefined)}
          />,
        );
      }
    }
  };

  return (
    <PluginPanel
      title={title}
      description={description}
      footer={<GitHubPagination itemCount={data?.workflow_runs.length || 0} page={page} setPage={setPage} />}
    >
      {isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Alert
          variant={AlertVariant.danger}
          isInline={true}
          title="Could not get repository workflow runs"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<TRepositoryWorkflowRuns, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data ? (
        <DataList
          aria-label="workflow runs"
          isCompact={true}
          onSelectDataListItem={setDetails ? selectWorkflowRun : undefined}
        >
          {data.workflow_runs.slice((page.page - 1) * page.perPage, page.page * page.perPage).map((run) => (
            <DataListItem
              id={run.id.toString()}
              key={run.id}
              aria-labelledby={run.head_commit?.message.split('\n')[0]}
              style={{ cursor: 'pointer' }}
            >
              <DataListItemRow>
                <DataListItemCells
                  dataListCells={[
                    <DataListCell key="main">
                      <Flex direction={{ default: 'column' }}>
                        <FlexItem>
                          <p>
                            {run.status === 'queued' ? (
                              <DotIcon size={16} fill="#c69026" />
                            ) : run.status === 'in_progress' ? (
                              <DotFillIcon size={16} fill="#c69026" />
                            ) : run.conclusion === 'success' ? (
                              <CheckCircleFillIcon size={16} fill="#57ab5a" />
                            ) : (
                              <XCircleFillIcon size={16} fill="#e5534b" />
                            )}
                            <span className="pf-u-pl-sm">{run.head_commit?.message.split('\n')[0]}</span>
                          </p>
                          <small>
                            {`${run.name} #${run.run_number}${
                              run.run_attempt && run.run_attempt !== 1 ? ` (Attempt #${run.run_attempt})` : ''
                            }: `}
                            {run.event === 'push'
                              ? `Commit ${run.head_commit?.id.slice(0, 7)} pushed by ${run.triggering_actor?.login}`
                              : run.event === 'schedule'
                              ? `Scheduled`
                              : `by ${run.triggering_actor?.login}`}
                          </small>
                        </FlexItem>
                      </Flex>
                    </DataListCell>,
                  ]}
                />
              </DataListItemRow>
            </DataListItem>
          ))}
        </DataList>
      ) : (
        <div></div>
      )}
    </PluginPanel>
  );
};

export default RepositoryWorkflowRuns;
