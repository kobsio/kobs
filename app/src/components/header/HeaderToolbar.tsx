import {
  Avatar,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownToggle,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import React, { useState } from 'react';

const HeaderToolbar: React.FunctionComponent = () => {
  const [isProfileDrowdownOpen, setIsProfileDrowdownOpen] = useState<boolean>(false);

  return (
    <Toolbar id="header-toolbar" isFullHeight={true} isStatic={true}>
      <ToolbarContent>
        <ToolbarItem alignment={{ default: 'alignRight' }} visibility={{ default: 'hidden', md: 'visible' }}>
          <Dropdown
            position="right"
            isOpen={isProfileDrowdownOpen}
            toggle={
              <DropdownToggle
                icon={<Avatar src={'http://www.gravatar.com/avatar/?d=mp'} alt="Avatar" />}
                onToggle={(): void => setIsProfileDrowdownOpen(!isProfileDrowdownOpen)}
              >
                Welcome
              </DropdownToggle>
            }
            dropdownItems={[
              <DropdownGroup key="group1">
                <DropdownItem key="group1-help">Documentation</DropdownItem>
              </DropdownGroup>,
            ]}
          />
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};

export default HeaderToolbar;
