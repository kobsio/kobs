import { Label } from '@patternfly/react-core';
import React from 'react';

interface IPriorityProps {
  priority: string;
}

const Priority: React.FunctionComponent<IPriorityProps> = ({ priority }: IPriorityProps) => {
  if (priority === 'P1') {
    return (
      <Label className="pf-u-mr-sm" color="red">
        P1
      </Label>
    );
  }
  if (priority === 'P2') {
    return (
      <Label className="pf-u-mr-sm" color="red">
        P2
      </Label>
    );
  }
  if (priority === 'P3') {
    return (
      <Label className="pf-u-mr-sm" color="orange">
        P3
      </Label>
    );
  }
  if (priority === 'P4') {
    return (
      <Label className="pf-u-mr-sm" color="green">
        P4
      </Label>
    );
  }
  if (priority === 'P5') {
    return (
      <Label className="pf-u-mr-sm" color="blue">
        P5
      </Label>
    );
  }

  return null;
};

export default Priority;
