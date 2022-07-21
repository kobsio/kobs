import React, { useContext } from 'react';
import { LogViewer } from '@patternfly/react-log-viewer';
import { useQuery } from 'react-query';

import { AuthContext, IAuthContext } from '../../../context/AuthContext';
import { IPluginInstance } from '@kobsio/shared';

interface IRepositoryWorkflowRunsDetailsJobsLogsProps {
  repo: string;
  id: number;
  instance: IPluginInstance;
}

const RepositoryWorkflowRunsDetailsJobsLogs: React.FunctionComponent<IRepositoryWorkflowRunsDetailsJobsLogsProps> = ({
  repo,
  id,
  instance,
}: IRepositoryWorkflowRunsDetailsJobsLogsProps) => {
  const authContext = useContext<IAuthContext>(AuthContext);

  const { data } = useQuery<string, Error>(
    ['github/team/workflowruns/jobs/logs', authContext.organization, repo, id, instance],
    async () => {
      try {
        const octokit = authContext.getOctokitClient();
        const logs = await octokit.actions.downloadJobLogsForWorkflowRun({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          job_id: id,
          owner: authContext.organization,
          repo: repo,
        });

        return logs.data as string;
      } catch (err) {
        throw err;
      }
    },
  );

  if (!data) {
    return null;
  }

  return <LogViewer hasLineNumbers={false} height={500} data={data} theme="light" />;
};

export default RepositoryWorkflowRunsDetailsJobsLogs;
