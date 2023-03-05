import { V1Pod } from '@kubernetes/client-node';
import { Subject as LogsIcon } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { FunctionComponent, useState } from 'react';
import { Link } from 'react-router-dom';

import { getContainers } from '../utils';

interface ILogsProps {
  cluster: string;
  name: string;
  namespace: string;
  onClose: (message: string, severity: 'success' | 'error') => void;
  open: boolean;
  pod: V1Pod;
}

const Logs: FunctionComponent<ILogsProps> = ({ cluster, namespace, name, pod, open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const containers = getContainers(pod);

  const [container, setContainer] = useState<string>(containers[0]);
  const [regex, setRegex] = useState<string>('');
  const [since, setSince] = useState<number>(900);
  const [previous, setPrevious] = useState<boolean>(false);
  const [follow, setFollow] = useState<boolean>(false);

  return (
    <Dialog open={open} onClose={() => onClose('', 'success')} fullScreen={fullScreen} maxWidth="md">
      <DialogTitle>Logs</DialogTitle>
      <DialogContent sx={{ minWidth: '50vw' }}>
        <Stack py={2} spacing={4} direction="column">
          <FormControl size="small" fullWidth={true}>
            <InputLabel id="logs-container">Container</InputLabel>
            <Select
              labelId="logs-container"
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
            label="Regex Filter"
            fullWidth={true}
            size="small"
            value={regex}
            onChange={(e) => setRegex(e.target.value)}
          />

          <FormControl size="small" fullWidth={true}>
            <InputLabel id="logs-since">Since</InputLabel>
            <Select
              labelId="logs-since"
              label="Since"
              value={since}
              onChange={(e): void => setSince(e.target.value as number)}
            >
              <MenuItem key={300} value={300}>
                5 Minutes
              </MenuItem>
              <MenuItem key={900} value={900}>
                15 Minutes
              </MenuItem>
              <MenuItem key={1800} value={1800}>
                30 Minutes
              </MenuItem>
              <MenuItem key={3600} value={3600}>
                1 Hour
              </MenuItem>
              <MenuItem key={10800} value={10800}>
                3 Hours
              </MenuItem>
              <MenuItem key={21600} value={21600}>
                6 Hours
              </MenuItem>
              <MenuItem key={43200} value={43200}>
                12 Hours
              </MenuItem>
              <MenuItem key={86400} value={86400}>
                1 Day
              </MenuItem>
              <MenuItem key={172800} value={172800}>
                2 Days
              </MenuItem>
              <MenuItem key={604800} value={604800}>
                7 Days
              </MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch size="small" value={previous} disabled={follow} onChange={(_, checked) => setPrevious(checked)} />
            }
            label="Previous"
          />

          <FormControlLabel
            control={
              <Switch size="small" value={follow} disabled={previous} onChange={(_, checked) => setFollow(checked)} />
            }
            label="Follow"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<LogsIcon />}
          component={Link}
          to={`/resources/logs?cluster=${cluster}&namespace=${namespace}&name=${name}&container=${container}&regex=${encodeURIComponent(
            regex,
          )}&since=${since}&previous=${previous}&follow=${follow}`}
          target="_blank"
          sx={{ mr: 2 }}
        >
          Get Logs
        </Button>
        <Button variant="outlined" size="small" onClick={() => onClose('', 'success')}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Logs;
