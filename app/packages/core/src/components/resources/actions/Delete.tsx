import { Delete as DeleteIcon } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { FunctionComponent, useContext, useState } from 'react';

import { APIContext, APIError, IAPIContext } from '../../../context/APIContext';
import { IResource } from '../utils';

interface IDeleteProps {
  cluster: string;
  name: string;
  namespace: string;
  onClose: (message: string, severity: 'success' | 'error') => void;
  open: boolean;
  resource: IResource;
}

const Delete: FunctionComponent<IDeleteProps> = ({ resource, cluster, namespace, name, open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const apiContext = useContext<IAPIContext>(APIContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [force, setForce] = useState<boolean>(false);

  const handleDelete = async (): Promise<void> => {
    setIsLoading(true);

    try {
      await apiContext.client.delete(
        `/api/resources?${namespace ? `&namespace=${namespace}` : ''}&name=${name}&resource=${resource.resource}&path=${
          resource.path
        }&force=${force}`,
        {
          headers: {
            'x-kobs-cluster': cluster,
          },
        },
      );

      setIsLoading(false);
      onClose(`${name} (${cluster} / ${namespace}) was deleted`, 'success');
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
      <DialogTitle>Delete {name}</DialogTitle>
      <DialogContent sx={{ minWidth: '50vw' }}>
        <Stack spacing={2} direction="column">
          <p>
            Do you really want to delete{' '}
            <b>
              {name} ({cluster} / {namespace})
            </b>
            ?
          </p>
          <FormControlLabel
            control={<Switch size="small" value={force} onChange={(_, checked) => setForce(checked)} />}
            label="Force"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          variant="contained"
          color="error"
          size="small"
          startIcon={<DeleteIcon />}
          loading={isLoading}
          loadingPosition="start"
          onClick={handleDelete}
        >
          Delete
        </LoadingButton>
        <Button variant="outlined" size="small" onClick={() => onClose('', 'success')}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Delete;
