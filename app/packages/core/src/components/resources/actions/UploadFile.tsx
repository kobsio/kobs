import { V1Pod } from '@kubernetes/client-node';
import { FileUpload as UploadFileIcon } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { FunctionComponent, ChangeEvent, useState } from 'react';

import { APIError } from '../../../context/APIContext';
import { getContainers } from '../utils';

/**
 * `ISourceFile` is the interface for the user selected file which should be uploaded. It contains the actual file and
 * the filename.
 */
interface ISourceFile {
  file: File;
  filename: string;
}

interface IUploadFileProps {
  cluster: string;
  name: string;
  namespace: string;
  onClose: (message: string, severity: 'success' | 'error') => void;
  open: boolean;
  pod: V1Pod;
}

const UploadFile: FunctionComponent<IUploadFileProps> = ({ cluster, namespace, name, pod, open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const containers = getContainers(pod);

  const [container, setContainer] = useState<string>(containers[0]);
  const [sourceFile, setSourceFile] = useState<ISourceFile>();
  const [destinationPath, setDestinationPath] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSourceFile({ file: e.target.files[0], filename: e.target.files[0].name });
    }
  };

  const handleUpload = async (): Promise<void> => {
    setIsLoading(true);

    try {
      if (!sourceFile) {
        throw new Error('Source file is missing');
      }

      const formData = new FormData();
      formData.append('file', sourceFile.file);

      const response = await fetch(
        `/api/resources/file?namespace=${namespace}&name=${name}&container=${container}&destPath=${destinationPath}`,
        {
          body: formData,
          headers: {
            'x-kobs-cluster': cluster,
          },
          method: 'post',
        },
      );

      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        setIsLoading(false);
        onClose(`File was uploaded`, 'success');
      } else {
        if (json.error) {
          throw new Error(json.error);
        } else {
          throw new Error('An unknown error occured');
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
      <DialogTitle>Upload File</DialogTitle>
      <DialogContent sx={{ minWidth: '50vw' }}>
        <Stack py={2} spacing={4} direction="column">
          <FormControl size="small" fullWidth={true}>
            <InputLabel id="upload-container">Container</InputLabel>
            <Select
              labelId="upload-container"
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

          <Button size="small" fullWidth={true} variant="contained" component="label">
            {!sourceFile ? 'Select a File' : sourceFile.filename}
            <input type="file" hidden={true} onChange={handleSelectFile} />
          </Button>

          <TextField
            label="Destination Path"
            fullWidth={true}
            size="small"
            value={destinationPath}
            onChange={(e) => setDestinationPath(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          disabled={isLoading}
          variant="contained"
          color="primary"
          size="small"
          startIcon={<UploadFileIcon />}
          loading={isLoading}
          loadingPosition="start"
          onClick={handleUpload}
        >
          Upload
        </LoadingButton>
        <Button variant="outlined" size="small" onClick={() => onClose('', 'success')}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadFile;
