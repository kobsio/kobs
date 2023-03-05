import { V1Pod } from '@kubernetes/client-node';
import { FileDownload as DownloadFileIcon } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { FunctionComponent, useState } from 'react';

import { APIError } from '../../../context/APIContext';
import { blobDownload } from '../../../utils/fileDownload';
import { getContainers } from '../utils';

interface IDownloadFileProps {
  cluster: string;
  name: string;
  namespace: string;
  onClose: (message: string, severity: 'success' | 'error') => void;
  open: boolean;
  pod: V1Pod;
}

const DownloadFile: FunctionComponent<IDownloadFileProps> = ({ cluster, namespace, name, pod, open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const containers = getContainers(pod);

  const [container, setContainer] = useState<string>(containers[0]);
  const [sourcePath, setSourcePath] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleDownload = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/resources/file?namespace=${namespace}&name=${name}&container=${container}&srcPath=${sourcePath}`,
        {
          headers: {
            'x-kobs-cluster': cluster,
          },
          method: 'get',
        },
      );

      if (response.status >= 200 && response.status < 300) {
        const data = await response.blob();
        blobDownload(data, `${name}_${container}.tar`);

        setIsLoading(false);
        onClose(`File was downloaded`, 'success');
      } else {
        const json = await response.json();

        if (json.errors) {
          throw new APIError(json.errors, response.status);
        } else {
          throw new APIError([`An unknown error occured: ${json}`], response.status);
        }
      }
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
      <DialogTitle>Download File</DialogTitle>
      <DialogContent sx={{ minWidth: '50vw' }}>
        <Stack py={2} spacing={4} direction="column">
          <FormControl size="small" fullWidth={true}>
            <InputLabel id="download-container">Container</InputLabel>
            <Select
              labelId="download-container"
              label="Container"
              value={container}
              onChange={(e): void => setContainer(e.target.value)}
            >
              {containers.map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Source Path"
            fullWidth={true}
            size="small"
            value={sourcePath}
            onChange={(e) => setSourcePath(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          disabled={isLoading}
          variant="contained"
          color="primary"
          size="small"
          startIcon={<DownloadFileIcon />}
          loading={isLoading}
          loadingPosition="start"
          onClick={handleDownload}
        >
          Download
        </LoadingButton>
        <Button variant="outlined" size="small" onClick={() => onClose('', 'success')}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DownloadFile;
