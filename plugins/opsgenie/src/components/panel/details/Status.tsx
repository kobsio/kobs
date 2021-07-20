import { Badge } from '@patternfly/react-core';
import React from 'react';

interface IStatusProps {
  status: string;
  snoozed: boolean;
  acknowledged: boolean;
}

const Status: React.FunctionComponent<IStatusProps> = ({ status, snoozed, acknowledged }: IStatusProps) => {
  if (status === 'closed') {
    return <Badge isRead={true}>closed</Badge>;
  } else if (snoozed) {
    return <Badge style={{ backgroundColor: 'var(--pf-global--warning-color--100)' }}>snoozed</Badge>;
  } else if (acknowledged) {
    return <Badge style={{ backgroundColor: 'var(--pf-global--primary-color--100)' }}>acknowledged</Badge>;
  } else {
    return <Badge style={{ backgroundColor: 'var(--pf-global--danger-color--100)' }}>open</Badge>;
  }
};

export default Status;
