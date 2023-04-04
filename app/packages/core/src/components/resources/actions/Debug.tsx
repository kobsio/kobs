import { V1EphemeralContainer } from '@kubernetes/client-node';
import { BugReport as DebugIcon } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, useTheme } from '@mui/material';
import { compare } from 'fast-json-patch';
import yaml from 'js-yaml';
import { FunctionComponent, useContext, useState } from 'react';

import { APIContext, APIError, IAPIContext } from '../../../context/APIContext';
import { Editor } from '../../utils/editor/Editor';

const randomString = (length: number): string => {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

interface IDebugProps {
  cluster: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manifest: any;
  name: string;
  namespace: string;
  onClose: (message: string, severity: 'success' | 'error') => void;
  open: boolean;
}

const Debug: FunctionComponent<IDebugProps> = ({ cluster, namespace, name, manifest, open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const apiContext = useContext<IAPIContext>(APIContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [debugContainer, setDebugContainer] = useState<string>(`name: debugger-${randomString(6)}
image: busybox
command:
  - sh
terminationMessagePolicy: File
imagePullPolicy: IfNotPresent
stdin: true
tty: true`);

  const handleCreateDebugContainer = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const parsedDebugContainer = yaml.load(debugContainer) as V1EphemeralContainer;

      const copy = JSON.parse(JSON.stringify(manifest));
      if (copy?.spec?.ephemeralContainers && copy?.spec?.ephemeralContainers.length > 0) {
        copy?.spec?.ephemeralContainers.push(parsedDebugContainer);
      } else {
        copy.spec = { ...copy?.spec, ephemeralContainers: [parsedDebugContainer] };
      }

      const diff = compare(manifest, copy);

      await apiContext.client.put(
        `/api/resources?namespace=${namespace}&name=${name}&resource=pods&path=/api/v1&subResource=ephemeralcontainers`,
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

  return (
    <Dialog open={open} onClose={() => onClose('', 'success')} fullScreen={fullScreen} maxWidth="md">
      <DialogTitle>Create Debug Container</DialogTitle>
      <DialogContent sx={{ minWidth: '50vw' }}>
        <Editor language="yaml" value={debugContainer} onChange={(value) => setDebugContainer(value ?? '')} />
      </DialogContent>
      <DialogActions>
        <LoadingButton
          variant="contained"
          color="primary"
          size="small"
          startIcon={<DebugIcon />}
          loading={isLoading}
          loadingPosition="start"
          onClick={handleCreateDebugContainer}
        >
          Create Debug Container
        </LoadingButton>
        <Button variant="outlined" size="small" onClick={() => onClose('', 'success')}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Debug;
