import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance, pluginBasePath } from '@kobsio/shared';

interface IAgentsPageActionsProps {
  instance: IPluginInstance;
}

export const AgentsPageActions: React.FunctionComponent<IAgentsPageActionsProps> = ({
  instance,
}: IAgentsPageActionsProps) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <Dropdown
      style={{ zIndex: 400 }}
      toggle={<KebabToggle onToggle={(): void => setShow(!show)} />}
      isOpen={show}
      isPlain={true}
      position="right"
      dropdownItems={[
        <DropdownItem key={0} component={<Link to={`${pluginBasePath(instance)}`}>Overview</Link>} />,
        <DropdownItem key={1} component={<Link to={`${pluginBasePath(instance)}/requests`}>Requests</Link>} />,
      ]}
    />
  );
};

export default AgentsPageActions;
