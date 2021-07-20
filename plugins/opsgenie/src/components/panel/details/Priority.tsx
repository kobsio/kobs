import { Badge } from '@patternfly/react-core';
import React from 'react';

interface IPriorityProps {
  priority: string;
}

const Priority: React.FunctionComponent<IPriorityProps> = ({ priority }: IPriorityProps) => {
  if (priority === 'P1') {
    return (
      <Badge className="pf-u-mr-sm" style={{ backgroundColor: 'var(--pf-global--danger-color--100)' }}>
        P1
      </Badge>
    );
  }
  if (priority === 'P2') {
    return (
      <Badge className="pf-u-mr-sm" style={{ backgroundColor: 'var(--pf-global--danger-color--100)' }}>
        P2
      </Badge>
    );
  }
  if (priority === 'P3') {
    return (
      <Badge className="pf-u-mr-sm" style={{ backgroundColor: 'var(--pf-global--warning-color--100)' }}>
        P3
      </Badge>
    );
  }
  if (priority === 'P4') {
    return (
      <Badge className="pf-u-mr-sm" style={{ backgroundColor: 'var(--pf-global--success-color--100)' }}>
        P4
      </Badge>
    );
  }
  if (priority === 'P5') {
    return (
      <Badge className="pf-u-mr-sm" style={{ backgroundColor: 'var(--pf-global--success-color--100)' }}>
        P5
      </Badge>
    );
  }

  return null;
};

export default Priority;
