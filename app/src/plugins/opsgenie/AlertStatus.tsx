import { Badge } from '@patternfly/react-core';
import React from 'react';

interface IAlertStatusProps {
  status: string;
  snoozed: boolean;
  acknowledged: boolean;
}

// AlertStatus returns the bade for the status of an alert. To determine the status of an alert, we need the status and
// the snoozed and acknowledged fields of the alert.
const AlertStatus: React.FunctionComponent<IAlertStatusProps> = ({
  status,
  snoozed,
  acknowledged,
}: IAlertStatusProps) => {
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

export default AlertStatus;
