import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance, pluginBasePath } from '@kobsio/shared';

interface ITracesActionsProps {
  instance: IPluginInstance;
}

export const TracesActions: React.FunctionComponent<ITracesActionsProps> = ({ instance }: ITracesActionsProps) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <Dropdown
      style={{ zIndex: 400 }}
      toggle={<KebabToggle onToggle={(): void => setShow(!show)} />}
      isOpen={show}
      isPlain={true}
      position="right"
      dropdownItems={[
        <DropdownItem key={0} component={<Link to={`${pluginBasePath(instance)}/trace`}>Compare Traces</Link>} />,
      ]}
    />
  );
};

export default TracesActions;
