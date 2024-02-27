import {
  DetailsDrawer,
  Editor,
  IPluginInstance,
  ITimes,
  Pagination,
  PluginPanel,
  UseQueryWrapper,
  formatTimeString,
  timeDifference,
} from '@kobsio/core';
import { ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { CheckCircleFillIcon, DotFillIcon, DotIcon, XCircleFillIcon } from '@primer/octicons-react';
import { useQuery } from '@tanstack/react-query';
import { Fragment, FunctionComponent, useContext, useState } from 'react';

import { AuthContext, IAuthContext } from '../../context/AuthContext';
import { TRepositoryWorkflowRun, TRepositoryWorkflowRuns, TRepositoryWorkflowRunsJobs } from '../../utils/utils';

const RepositoryWorkflowRunsDetailsJobsLogs: FunctionComponent<{
  id: number;
  instance: IPluginInstance;
  repo: string;
  times: ITimes;
}> = ({ repo, id, instance, times }) => {
  const authContext = useContext<IAuthContext>(AuthContext);

  const { data } = useQuery<string, Error>(
    ['github/repo/workflowruns/jobs/logs', authContext.organization, times, repo, id, instance],
    async () => {
      const octokit = authContext.getOctokitClient();
      const logs = await octokit.actions.downloadJobLogsForWorkflowRun({
        job_id: id,
        owner: authContext.organization,
        repo: repo,
      });

      return logs.data as string;
    },
  );

  if (!data) {
    return null;
  }

  return (
    <Box height="300px" pt={4}>
      <Editor language="plain" readOnly={true} value={data} />
    </Box>
  );
};

const RepositoryWorkflowRunsDetailsJobs: FunctionComponent<{
  attempt: number;
  id: number;
  instance: IPluginInstance;
  repo: string;
  times: ITimes;
}> = ({ repo, id, attempt, instance, times }) => {
  const authContext = useContext<IAuthContext>(AuthContext);

  const { isError, isLoading, error, data, refetch } = useQuery<TRepositoryWorkflowRunsJobs, Error>(
    ['github/repo/workflowruns/jobs', authContext.organization, repo, id, attempt, instance, times],
    async () => {
      const octokit = authContext.getOctokitClient();
      const jobs = await octokit.actions.listJobsForWorkflowRunAttempt({
        attempt_number: attempt,
        owner: authContext.organization,
        page: 1,
        per_page: 100,
        repo: repo,
        run_id: id,
      });
      return jobs.data;
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to get jobs"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.jobs.length === 0}
      noDataTitle="No jobs were found"
      refetch={refetch}
    >
      {data?.jobs.map((job) => (
        <Accordion key={job.id} TransitionProps={{ unmountOnExit: true }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>{job.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {job.steps && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {job.steps.map((step) => (
                      <TableRow
                        key={step.number}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        hover={true}
                      >
                        <TableCell>{step.name}</TableCell>
                        <TableCell>
                          {step.completed_at && step.started_at
                            ? timeDifference(new Date(step.completed_at).getTime(), new Date(step.started_at).getTime())
                            : step.started_at
                              ? formatTimeString(step.started_at)
                              : ''}
                        </TableCell>
                        <TableCell>
                          {step.status === 'queued' ? (
                            <DotIcon size={16} fill="#c69026" />
                          ) : step.status === 'in_progress' ? (
                            <DotFillIcon size={16} fill="#c69026" />
                          ) : step.conclusion === 'success' ? (
                            <CheckCircleFillIcon size={16} fill="#57ab5a" />
                          ) : (
                            <XCircleFillIcon size={16} fill="#e5534b" />
                          )}
                          <Box component="span" pl={1}>
                            {step.status}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <RepositoryWorkflowRunsDetailsJobsLogs instance={instance} id={job.id} repo={repo} times={times} />
          </AccordionDetails>
        </Accordion>
      ))}
    </UseQueryWrapper>
  );
};

const RepositoryWorkflowRunDetails: FunctionComponent<{
  instance: IPluginInstance;
  onClose: () => void;
  open: boolean;
  repo: string;
  run: TRepositoryWorkflowRun;
  times: ITimes;
}> = ({ instance, run, repo, times, open, onClose }) => {
  return (
    <DetailsDrawer
      size="large"
      open={open}
      onClose={onClose}
      title={run.head_commit?.message.split('\n')[0]}
      subtitle={
        <>
          {`${run.name} #${run.run_number}${
            run.run_attempt && run.run_attempt !== 1 ? ` (Attempt #${run.run_attempt})` : ''
          }: `}
          {run.event === 'push'
            ? `Commit ${run.head_commit?.id.slice(0, 7)} pushed by ${run.triggering_actor?.login}`
            : run.event === 'schedule'
              ? `Scheduled`
              : `by ${run.triggering_actor?.login}`}
        </>
      }
    >
      <RepositoryWorkflowRunsDetailsJobs
        instance={instance}
        id={run.id}
        attempt={run.run_attempt ?? 1}
        repo={repo}
        times={times}
      />
    </DetailsDrawer>
  );
};

const RepositoryWorkflowRun: FunctionComponent<{
  instance: IPluginInstance;
  repo: string;
  run: TRepositoryWorkflowRun;
  times: ITimes;
}> = ({ instance, run, repo, times }) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <ListItem sx={{ cursor: 'pointer' }} onClick={() => setOpen(true)}>
        <ListItemText
          primary={
            <Typography variant="h6">
              {run.status === 'queued' ? (
                <DotIcon size={16} fill="#c69026" />
              ) : run.status === 'in_progress' ? (
                <DotFillIcon size={16} fill="#c69026" />
              ) : run.conclusion === 'success' ? (
                <CheckCircleFillIcon size={16} fill="#57ab5a" />
              ) : (
                <XCircleFillIcon size={16} fill="#e5534b" />
              )}
              <Box component="span" pl={1}>
                {run.head_commit?.message.split('\n')[0]}
              </Box>
            </Typography>
          }
          secondaryTypographyProps={{ component: 'div' }}
          secondary={
            <>
              {`${run.name} #${run.run_number}${
                run.run_attempt && run.run_attempt !== 1 ? ` (Attempt #${run.run_attempt})` : ''
              }: `}
              {run.event === 'push'
                ? `Commit ${run.head_commit?.id.slice(0, 7)} pushed by ${run.triggering_actor?.login}`
                : run.event === 'schedule'
                  ? `Scheduled`
                  : `by ${run.triggering_actor?.login}`}
            </>
          }
        />
      </ListItem>

      {open && (
        <RepositoryWorkflowRunDetails
          instance={instance}
          run={run}
          repo={repo}
          times={times}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

export const RepositoryWorkflowRuns: FunctionComponent<{
  description?: string;
  instance: IPluginInstance;
  repo: string;
  times: ITimes;
  title: string;
}> = ({ title, description, repo, instance, times }) => {
  const authContext = useContext<IAuthContext>(AuthContext);
  const [options, setOptions] = useState<{ page: number; perPage: number }>({ page: 1, perPage: 10 });

  const { isError, isLoading, error, data, refetch } = useQuery<TRepositoryWorkflowRuns, Error>(
    ['github/repo/workflowruns', authContext.organization, instance, times, repo, options],
    async () => {
      const octokit = authContext.getOctokitClient();
      const workflowRuns = await octokit.actions.listWorkflowRunsForRepo({
        owner: authContext.organization,
        page: options.page,
        per_page: options.perPage,
        repo: repo,
      });
      return workflowRuns.data;
    },
  );

  return (
    <PluginPanel title={title} description={description}>
      <UseQueryWrapper
        error={error}
        errorTitle="Failed to get workflow runs"
        isError={isError}
        isLoading={isLoading}
        isNoData={!data || data.workflow_runs.length === 0}
        noDataTitle="No workflow runs were found"
        refetch={refetch}
      >
        <List disablePadding={true}>
          {data?.workflow_runs.map((run, index) => (
            <Fragment key={run.id}>
              <RepositoryWorkflowRun instance={instance} run={run} repo={repo} times={times} />
              {index + 1 !== data?.workflow_runs.length && <Divider component="li" />}
            </Fragment>
          ))}
        </List>
        <Pagination
          count={data?.total_count ?? 0}
          page={options.page}
          perPage={options.perPage}
          handleChange={(page, perPage) => setOptions({ page: page, perPage: perPage })}
        />
      </UseQueryWrapper>
    </PluginPanel>
  );
};
