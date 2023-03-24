import { Chip } from '@mui/material';
import { FunctionComponent } from 'react';

interface IStatusProps {
  acknowledged: boolean;
  snoozed: boolean;
  status: string;
}

const Status: FunctionComponent<IStatusProps> = ({ status, snoozed, acknowledged }) => {
  if (status === 'closed') {
    return <Chip sx={{ ml: 2 }} size="small" color="default" label="closed" />;
  } else if (status === 'resolved') {
    return <Chip sx={{ ml: 2 }} size="small" color="warning" label="resolved" />;
  } else if (snoozed) {
    return <Chip sx={{ ml: 2 }} size="small" color="warning" label="snoozed" />;
  } else if (acknowledged) {
    return <Chip sx={{ ml: 2 }} size="small" color="info" label="acknowledged" />;
  } else {
    return <Chip sx={{ ml: 2 }} size="small" color="error" label={status} />;
  }
};

export default Status;
