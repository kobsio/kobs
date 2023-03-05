import { RestartAlt as RestartIcon } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, useTheme } from '@mui/material';
import { compare } from 'fast-json-patch';
import { FunctionComponent, useContext, useState } from 'react';

import { APIContext, APIError, IAPIContext } from '../../../context/APIContext';
import { IResource } from '../utils';

interface IRestartProps {
  cluster: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manifest: any;
  name: string;
  namespace: string;
  onClose: (message: string, severity: 'success' | 'error') => void;
  open: boolean;
  resource: IResource;
}

const Restart: FunctionComponent<IRestartProps> = ({ resource, cluster, namespace, name, manifest, open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const apiContext = useContext<IAPIContext>(APIContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRestart = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const now = new Date();
      const copy = JSON.parse(JSON.stringify(manifest));

      if (copy.spec && copy.spec.template.metadata) {
        if (copy.spec.template.metadata.annotations) {
          copy.spec.template.metadata.annotations['kobs.io/restartedAt'] = now.toJSON();
        } else {
          copy.spec.template.metadata.annotations = { 'kobs.io/restartedAt': now.toJSON() };
        }
      }

      const diff = compare(manifest, copy);

      await apiContext.client.put(
        `/api/resources?namespace=${namespace}&name=${name}&resource=${resource.resource}&path=${resource.path}`,
        {
          body: diff,
          headers: {
            'x-kobs-cluster': cluster,
          },
        },
      );

      setIsLoading(false);
      onClose(`${name} was restarted`, 'success');
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
      <DialogTitle>Restart {name}</DialogTitle>
      <DialogContent sx={{ minWidth: '50vw' }}>
        <p>
          Do you really want to restart{' '}
          <b>
            {name} ({cluster} / {namespace})
          </b>{' '}
          ?
        </p>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          variant="contained"
          color="primary"
          size="small"
          startIcon={<RestartIcon />}
          loading={isLoading}
          loadingPosition="start"
          onClick={handleRestart}
        >
          Restart
        </LoadingButton>
        <Button variant="outlined" size="small" onClick={() => onClose('', 'success')}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Restart;
