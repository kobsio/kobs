import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import React, { useState } from 'react';

import { IItem } from '../../../utils/interfaces';

interface IActionsProps {
  item: IItem;
}

const Actions: React.FunctionComponent<IActionsProps> = ({ item }: IActionsProps) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  if (!item.link) {
    return null;
  }

  return (
    <Dropdown
      className="pf-c-drawer__close"
      toggle={<KebabToggle onToggle={(): void => setShowDropdown(!showDropdown)} />}
      isOpen={showDropdown}
      isPlain={true}
      position="right"
      dropdownItems={[
        <DropdownItem key={0} href={item.link} target="_blank">
          Open
        </DropdownItem>,
      ]}
    />
  );
};

export default Actions;
