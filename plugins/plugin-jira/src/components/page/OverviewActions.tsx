import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance, pluginBasePath } from '@kobsio/shared';

interface IOverviewActionsProps {
  instance: IPluginInstance;
}

export const OverviewActions: React.FunctionComponent<IOverviewActionsProps> = ({
  instance,
}: IOverviewActionsProps) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <Dropdown
      style={{ zIndex: 400 }}
      toggle={<KebabToggle onToggle={(): void => setShow(!show)} />}
      isOpen={show}
      isPlain={true}
      position="right"
      dropdownItems={[
        <DropdownItem key={0} component={<Link to={`${pluginBasePath(instance)}/search`}>Search</Link>} />,
      ]}
    />
  );
};

export default OverviewActions;
