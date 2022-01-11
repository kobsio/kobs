import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface ITracesActionsProps {
  name: string;
}

export const TracesActions: React.FunctionComponent<ITracesActionsProps> = ({ name }: ITracesActionsProps) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <span style={{ float: 'right', position: 'absolute', right: 0, top: 0 }}>
      <Dropdown
        style={{ zIndex: 400 }}
        toggle={<KebabToggle onToggle={(): void => setShow(!show)} />}
        isOpen={show}
        isPlain={true}
        position="right"
        dropdownItems={[<DropdownItem key={0} component={<Link to={`/${name}/trace`}>Compare Traces</Link>} />]}
      />
    </span>
  );
};

export default TracesActions;
