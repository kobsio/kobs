import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance, pluginBasePath } from '@kobsio/shared';

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
        <DropdownItem key={0} component={<Link to={`${pluginBasePath(instance)}/metrics`}>Metrics</Link>} />,
        <DropdownItem
          key={1}
          component={
            <a href="https://kobs.io/main/plugins/datadog/" target="_blank" rel="noreferrer">
              Documentation
            </a>
          }
        />,
      ]}
    />
  );
};

export default LogsPageActions;
