import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { IPluginInstance, ITimes, pluginBasePath } from '@kobsio/shared';

interface IOperationActionsProps {
  instance: IPluginInstance;
  service: string;
  operation: string;
  times: ITimes;
}

const OperationActions: React.FunctionComponent<IOperationActionsProps> = ({
  instance,
  service,
  operation,
  times,
}: IOperationActionsProps) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  return (
    <Dropdown
      className="pf-c-drawer__close"
      toggle={<KebabToggle onToggle={(): void => setShowDropdown(!showDropdown)} />}
      isOpen={showDropdown}
      isPlain={true}
      position="right"
      dropdownItems={[
        <DropdownItem
          key={0}
          component={
            <Link
              to={`${pluginBasePath(instance)}?service=${service}&operation=${operation}&time=${times.time}&timeStart=${
                times.timeStart
              }&timeEnd=${times.timeEnd}`}
            >
              Traces
            </Link>
          }
        />,
      ]}
    />
  );
};

export default OperationActions;
