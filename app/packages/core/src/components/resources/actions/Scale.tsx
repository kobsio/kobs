import { Difference as ScaleIcon } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { FunctionComponent, useEffect, useState, useContext } from 'react';

import { APIContext, APIError, IAPIContext } from '../../../context/APIContext';
import { IResource } from '../utils';

interface IScaleProps {
  cluster: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manifest: any;
  name: string;
  namespace: string;
  onClose: (message: string, severity: 'success' | 'error') => void;
  open: boolean;
  resource: IResource;
}

const Scale: FunctionComponent<IScaleProps> = ({ resource, cluster, namespace, name, manifest, open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const apiContext = useContext<IAPIContext>(APIContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [replicas, setReplicas] = useState<number>(manifest?.spec?.replicas || 0);

  const handleScale = async (): Promise<void> => {
    setIsLoading(true);

    try {
      await apiContext.client.put(
        `/api/resources?&namespace=${namespace}&name=${name}&resource=${resource.resource}&path=${resource.path}`,
        {
          body: [{ op: 'replace', path: '/spec/replicas', value: replicas }],
          headers: {
            'x-kobs-cluster': cluster,
          },
        },
      );

      setIsLoading(false);
      onClose(`Scale replicas for ${name} to ${replicas}`, 'success');
    } catch (err) {
      setIsLoading(false);

      if (err instanceof APIError) {
        onClose(err.message, 'error');
      } else {
        onClose('', 'error');
      }
    }
  };

  useEffect(() => {
    setReplicas(manifest?.spec?.replicas || 0);
  }, [manifest?.spec?.replicas]);

  return (
    <Dialog open={open} onClose={() => onClose('', 'success')} fullScreen={fullScreen} maxWidth="md">
      <DialogTitle>Scale {name}</DialogTitle>
      <DialogContent sx={{ minWidth: '50vw' }}>
        <Stack spacing={2} direction="column">
          <p>
            Set new replica count for{' '}
            <b>
              {name} ({cluster} / {namespace})
            </b>
            :
          </p>
          <TextField
            size="small"
            label="Replicas"
            type="number"
            value={replicas}
            onChange={(e) => setReplicas(parseInt(e.target.value))}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          variant="contained"
          color="primary"
          size="small"
          startIcon={<ScaleIcon />}
          loading={isLoading}
          loadingPosition="start"
          onClick={handleScale}
        >
          Scale
        </LoadingButton>
        <Button variant="outlined" size="small" onClick={() => onClose('', 'success')}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Scale;
