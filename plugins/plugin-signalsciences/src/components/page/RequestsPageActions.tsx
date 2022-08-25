import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance, pluginBasePath } from '@kobsio/shared';

interface IRequestsPageActionsProps {
  instance: IPluginInstance;
}

export const RequestsPageActions: React.FunctionComponent<IRequestsPageActionsProps> = ({
  instance,
}: IRequestsPageActionsProps) => {
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
        <DropdownItem key={1} component={<Link to={`${pluginBasePath(instance)}/agents`}>Agents</Link>} />,
      ]}
    />
  );
};

export default RequestsPageActions;
