import { V1Pod } from '@kubernetes/client-node';
import { Terminal as TerminalIcon } from '@mui/icons-material';
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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { FunctionComponent, useState } from 'react';
import { Link } from 'react-router-dom';

import { getContainers } from '../utils';

interface ITerminalProps {
  cluster: string;
  name: string;
  namespace: string;
  onClose: (message: string, severity: 'success' | 'error') => void;
  open: boolean;
  pod: V1Pod;
}

const Terminal: FunctionComponent<ITerminalProps> = ({ cluster, namespace, name, pod, open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const containers = getContainers(pod);

  const [container, setContainer] = useState<string>(containers[0]);
  const [shell, setShell] = useState<string>('sh');

  return (
    <Dialog open={open} onClose={() => onClose('', 'success')} fullScreen={fullScreen} maxWidth="md">
      <DialogTitle>Terminal</DialogTitle>
      <DialogContent sx={{ minWidth: '50vw' }}>
        <Stack py={2} spacing={4} direction="column">
          <FormControl size="small" fullWidth={true}>
            <InputLabel id="terminal-container">Container</InputLabel>
            <Select
              labelId="terminal-container"
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

          <FormControl size="small" fullWidth={true}>
            <InputLabel id="terminal-shell">Shell</InputLabel>
            <Select
              labelId="terminal-shell"
              label="Shell"
              value={shell}
              onChange={(e): void => setShell(e.target.value)}
            >
              <MenuItem key="bash" value="bash">
                bash
              </MenuItem>
              <MenuItem key="sh" value="sh">
                sh
              </MenuItem>
              <MenuItem key="pwsh" value="pwsh">
                pwsh
              </MenuItem>
              <MenuItem key="cmd" value="cmd">
                cmd
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<TerminalIcon />}
          component={Link}
          to={`/resources/terminal?cluster=${cluster}&namespace=${namespace}&name=${name}&container=${container}&shell=${shell}`}
          target="_blank"
          sx={{ mr: 2 }}
        >
          Connect
        </Button>
        <Button variant="outlined" size="small" onClick={() => onClose('', 'success')}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Terminal;
