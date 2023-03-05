import { V1CronJob, V1Job } from '@kubernetes/client-node';
import { PlayArrow as CreateJobIcon } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, useTheme } from '@mui/material';
import { FunctionComponent, useContext, useState } from 'react';

import { APIContext, APIError, IAPIContext } from '../../../context/APIContext';

const randomString = (length: number): string => {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

interface ICreateJobProps {
  cluster: string;
  cronJob?: V1CronJob;
  name: string;
  namespace: string;
  onClose: (message: string, severity: 'success' | 'error') => void;
  open: boolean;
}

const CreateJob: FunctionComponent<ICreateJobProps> = ({ cluster, namespace, name, cronJob, open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const apiContext = useContext<IAPIContext>(APIContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const jobName = `${name}-manual-${randomString(6)}`.toLowerCase();

  const handleCreateJob = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const job: V1Job = {
        apiVersion: 'batch/v1',
        kind: 'Job',
        metadata: {
          annotations: {
            'cronjob.kubernetes.io/instantiate': 'manual',
          },
          labels: {
            'job-name': jobName,
          },
          name: jobName,
          namespace: namespace,
        },
        spec: cronJob?.spec?.jobTemplate.spec,
      };

      if (job.spec) {
        if (job.spec.template.metadata) {
          if (job.spec.template.metadata.labels) {
            job.spec.template.metadata.labels['job-name'] = jobName;
          }
        } else {
          job.spec.template.metadata = {
            labels: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'job-name': jobName,
            },
          };
        }
      }

      await apiContext.client.post(
        `/api/resources?${namespace ? `&namespace=${namespace}` : ''}&resource=jobs&path=/apis/batch/v1`,
        {
          body: job,
          headers: {
            'x-kobs-cluster': cluster,
          },
        },
      );

      setIsLoading(false);
      onClose(`Job ${jobName} was created`, 'success');
    } catch (err) {
      setIsLoading(false);

      if (err instanceof APIError) {
        onClose(err.message, 'error');
      } else {
        onClose('', 'error');
      }
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose('', 'success')} fullScreen={fullScreen} maxWidth="md">
      <DialogTitle>Create Job {jobName}</DialogTitle>
      <DialogContent sx={{ minWidth: '50vw' }}>
        <p>
          Do you really want to trigger the CronJob{' '}
          <b>
            {name} ({cluster} / {namespace})
          </b>{' '}
          manually?
        </p>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          variant="contained"
          color="primary"
          size="small"
          startIcon={<CreateJobIcon />}
          loading={isLoading}
          loadingPosition="start"
          onClick={handleCreateJob}
        >
          Create Job
        </LoadingButton>
        <Button variant="outlined" size="small" onClick={() => onClose('', 'success')}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateJob;
