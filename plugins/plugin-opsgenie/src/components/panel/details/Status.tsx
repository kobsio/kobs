import { Label } from '@patternfly/react-core';
import React from 'react';

interface IStatusProps {
  status: string;
  snoozed: boolean;
  acknowledged: boolean;
}

const Status: React.FunctionComponent<IStatusProps> = ({ status, snoozed, acknowledged }: IStatusProps) => {
  if (status === 'closed') {
    return <Label color="grey">closed</Label>;
  } else if (status === 'resolved') {
    return <Label color="orange">resolved</Label>;
  } else if (snoozed) {
    return <Label color="orange">snoozed</Label>;
  } else if (acknowledged) {
    return <Label color="blue">acknowledged</Label>;
  } else {
    return <Label color="red">{status}</Label>;
  }
};

export default Status;
