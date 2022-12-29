import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance, pluginBasePath } from '@kobsio/shared';

interface ILogsPageActionsProps {
  instance: IPluginInstance;
  query: string;
}

export const LogsPageActions: React.FunctionComponent<ILogsPageActionsProps> = ({
  instance,
  query,
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
            <Link to={`${pluginBasePath(instance)}/aggregation?query=${encodeURIComponent(query)}`}>Aggregation</Link>
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
