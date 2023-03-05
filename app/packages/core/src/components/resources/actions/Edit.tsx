import { Save } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, useTheme } from '@mui/material';
import { compare } from 'fast-json-patch';
import yaml from 'js-yaml';
import { FunctionComponent, useContext, useEffect, useState } from 'react';

import { APIContext, APIError, IAPIContext } from '../../../context/APIContext';
import { Editor } from '../../utils/editor/Editor';
import { IResource } from '../utils';

interface IEditProps {
  cluster: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manifest: any;
  name: string;
  namespace: string;
  onClose: (message: string, severity: 'success' | 'error') => void;
  open: boolean;
  resource: IResource;
}

const Edit: FunctionComponent<IEditProps> = ({ resource, cluster, namespace, name, manifest, open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const apiContext = useContext<IAPIContext>(APIContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [value, setValue] = useState<string>(yaml.dump(manifest));

  const handleEdit = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const parsedValue = yaml.load(value);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const diff = compare(manifest, parsedValue as any);

      await apiContext.client.put(
        `/api/resources?${namespace ? `&namespace=${namespace}` : ''}&name=${name}&resource=${resource.resource}&path=${
          resource.path
        }`,
        {
          body: diff,
          headers: {
            'x-kobs-cluster': cluster,
          },
        },
      );

      setIsLoading(false);
      onClose(`${name} was saved`, 'success');
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
    setValue(yaml.dump(manifest));
  }, [manifest]);

  return (
    <Dialog open={open} onClose={() => onClose('', 'success')} fullScreen={fullScreen} maxWidth="md">
      <DialogTitle>Edit {name}</DialogTitle>
      <DialogContent sx={{ minWidth: '50vw' }}>
        <Box height="50vh">
          <Editor language="yaml" value={value} onChange={(value) => setValue(value ?? '')} readOnly={false} />
        </Box>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          variant="contained"
          color="primary"
          size="small"
          startIcon={<Save />}
          loading={isLoading}
          loadingPosition="start"
          onClick={handleEdit}
        >
          Save
        </LoadingButton>
        <Button variant="outlined" size="small" onClick={() => onClose('', 'success')}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Edit;
