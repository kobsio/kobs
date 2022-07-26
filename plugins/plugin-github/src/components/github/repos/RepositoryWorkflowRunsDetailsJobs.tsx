import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Alert,
  AlertActionLink,
  AlertVariant,
  Spinner,
} from '@patternfly/react-core';
import { CheckCircleFillIcon, DotFillIcon, DotIcon, XCircleFillIcon } from '@primer/octicons-react';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React, { useContext, useState } from 'react';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { AuthContext, IAuthContext } from '../../../context/AuthContext';
import { IPluginInstance, formatTime, timeDifference } from '@kobsio/shared';
import RepositoryWorkflowRunsDetailsJobsLogs from './RepositoryWorkflowRunsDetailsJobsLogs';
import { TRepositoryWorkflowRunsJobs } from '../../../utils/interfaces';

interface IRepositoryWorkflowRunsDetailsJobsProps {
  repo: string;
  id: number;
  attempt: number;
  instance: IPluginInstance;
}

const RepositoryWorkflowRunsDetailsJobs: React.FunctionComponent<IRepositoryWorkflowRunsDetailsJobsProps> = ({
  repo,
  id,
  attempt,
  instance,
}: IRepositoryWorkflowRunsDetailsJobsProps) => {
  const authContext = useContext<IAuthContext>(AuthContext);
  const [expanded, setExpanded] = useState<number>(-1);

  const { isError, isLoading, error, data, refetch } = useQuery<TRepositoryWorkflowRunsJobs, Error>(
    ['github/team/workflowruns/jobs', authContext.organization, repo, id, attempt, instance],
    async () => {
      try {
        const octokit = authContext.getOctokitClient();
        const jobs = await octokit.actions.listJobsForWorkflowRunAttempt({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          attempt_number: attempt,
          owner: authContext.organization,
          page: 1,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          per_page: 100,
          repo: repo,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          run_id: id,
        });
        return jobs.data;
      } catch (err) {
        throw err;
      }
    },
  );

  const onToggle = (id: number): void => {
    if (id === expanded) {
      setExpanded(-1);
    } else {
      setExpanded(id);
    }
  };

  if (isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        variant={AlertVariant.danger}
        isInline={true}
        title="Could not get repository workflow runs"
        actionLinks={
          <React.Fragment>
            <AlertActionLink
              onClick={(): Promise<QueryObserverResult<TRepositoryWorkflowRunsJobs, Error>> => refetch()}
            >
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data || !data.jobs || data.jobs.length === 0) {
    return null;
  }

  return (
    <Accordion asDefinitionList={true}>
      {data.jobs.map((job) => (
        <AccordionItem key={job.id}>
          <AccordionToggle
            onClick={(): void => onToggle(job.id)}
            isExpanded={expanded === job.id}
            id={job.id.toString()}
          >
            {job.name}
          </AccordionToggle>
          <AccordionContent id={job.id.toString()} isHidden={expanded !== job.id}>
            {job.steps && (
              <TableComposable aria-label={job.name} variant={TableVariant.compact} borders={true}>
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Duration</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {job.steps.map((step) => (
                    <Tr key={step.number}>
                      <Td dataLabel="Name">{step.name}</Td>
                      <Td dataLabel="Duration">
                        {step.completed_at && step.started_at
                          ? timeDifference(new Date(step.completed_at).getTime(), new Date(step.started_at).getTime())
                          : step.started_at
                          ? formatTime(new Date(step.started_at).getTime())
                          : ''}
                      </Td>
                      <Td dataLabel="Status">
                        {step.status === 'queued' ? (
                          <DotIcon size={16} fill="#c69026" />
                        ) : step.status === 'in_progress' ? (
                          <DotFillIcon size={16} fill="#c69026" />
                        ) : step.conclusion === 'success' ? (
                          <CheckCircleFillIcon size={16} fill="#57ab5a" />
                        ) : (
                          <XCircleFillIcon size={16} fill="#e5534b" />
                        )}
                        <span className="pf-u-pl-sm">{step.status}</span>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </TableComposable>
            )}

            {expanded === job.id && (
              <div className="pf-u-pt-sm">
                <RepositoryWorkflowRunsDetailsJobsLogs repo={repo} id={job.id} instance={instance} />
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default RepositoryWorkflowRunsDetailsJobs;
