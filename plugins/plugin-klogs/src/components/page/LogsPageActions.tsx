import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance } from '@kobsio/shared';

interface ILogsPageActionsProps {
  instance: IPluginInstance;
}

export const LogsPageActions: React.FunctionComponent<ILogsPageActionsProps> = ({
  instance,
}: ILogsPageActionsProps) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <Dropdown
      style={{ zIndex: 400 }}
      toggle={<KebabToggle onToggle={(): void => setShow(!show)} />}
      isOpen={show}
      isPlain={true}
      position="right"
      dropdownItems={[
        <DropdownItem
          key={0}
          component={
            <Link to={`/plugins/${instance.satellite}/${instance.type}/${instance.name}/aggregation`}>Aggregation</Link>
          }
        />,
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
  );
};

export default LogsPageActions;
