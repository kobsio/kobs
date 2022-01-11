import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface ILogsPageActionsProps {
  name: string;
}

export const LogsPageActions: React.FunctionComponent<ILogsPageActionsProps> = ({ name }: ILogsPageActionsProps) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <span style={{ float: 'right', position: 'absolute', right: 0, top: 0 }}>
      <Dropdown
        style={{ zIndex: 400 }}
        toggle={<KebabToggle onToggle={(): void => setShow(!show)} />}
        isOpen={show}
        isPlain={true}
        position="right"
        dropdownItems={[
          <DropdownItem key={0} component={<Link to={`/${name}/aggregation`}>Aggregation</Link>} />,
          <DropdownItem
            key={1}
            component={
              <a href="https://kobs.io/main/plugins/klogs/" target="_blank" rel="noreferrer">
                Documentation
              </a>
            }
          />,
        ]}
      />
    </span>
  );
};

export default LogsPageActions;
