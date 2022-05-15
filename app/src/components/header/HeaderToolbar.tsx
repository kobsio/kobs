import {
  Avatar,
  Button,
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  DropdownToggle,
  KebabToggle,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarGroupVariant,
  ToolbarItem,
} from '@patternfly/react-core';
import { CogIcon, QuestionCircleIcon } from '@patternfly/react-icons';
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import md5 from 'md5';

import { AuthContext, IAuthContext } from '../../context/AuthContext';

const HeaderToolbar: React.FunctionComponent = () => {
  const authContext = useContext<IAuthContext>(AuthContext);
  const [isProfileDrowdownOpen, setIsProfileDrowdownOpen] = useState<boolean>(false);
  const [isMobileDrowdownOpen, setIsMobileDrowdownOpen] = useState<boolean>(false);

  const getProfileImageURL = (): string => {
    return (
      'https://secure.gravatar.com/avatar/' + md5(authContext.user.email.toLowerCase().trim()) + '?size=64&default=mm'
    );
  };

  // const mobileDrowdownOpen: React.ReactElement[] = [];
  // if (authContext.user.email) {
  //   mobileDrowdownOpen.push(
  //     <DropdownItem key="myprofile" component={(props): React.ReactElement => <Link {...props} to="/profile" />}>
  //       My profile
  //     </DropdownItem>,
  //   );
  //   mobileDrowdownOpen.push(<DropdownSeparator key="divider1" />);
  //   mobileDrowdownOpen.push(
  //     <DropdownItem key="logout" component={(props): React.ReactElement => <a {...props} href="/api/auth/logout" />}>
  //       Logout
  //     </DropdownItem>,
  //   );
  //   mobileDrowdownOpen.push(<DropdownSeparator key="divider2" />);
  // }
  // mobileDrowdownOpen.push(
  //   <DropdownItem key="settings" component={(props): React.ReactElement => <Link {...props} to="/settings" />}>
  //     <CogIcon /> Settings
  //   </DropdownItem>,
  // );
  // mobileDrowdownOpen.push(
  //   <DropdownItem
  //     key="help"
  //     component={(props): React.ReactElement => (
  //       <a {...props} href="https://kobs.io" target="_blank" rel="noreferrer" />
  //     )}
  //   >
  //     <QuestionCircleIcon /> Help
  //   </DropdownItem>,
  // );

  return (
    <Toolbar id="header-toolbar" isFullHeight={true} isStatic={true}>
      <ToolbarContent>
        <ToolbarGroup
          variant={ToolbarGroupVariant['icon-button-group']}
          alignment={{ default: 'alignRight' }}
          spacer={{ default: 'spacerNone', md: 'spacerMd' }}
        >
          {/* <ToolbarItem>
            <Button aria-label="Notifications" variant={ButtonVariant.plain}>
              <AttentionBellIcon />
            </Button>
          </ToolbarItem> */}
          <ToolbarGroup
            variant={ToolbarGroupVariant['icon-button-group']}
            visibility={{ default: 'hidden', lg: 'visible' }}
          >
            <ToolbarItem>
              <Button
                aria-label="Settings actions"
                variant={ButtonVariant.plain}
                component={(props): React.ReactElement => <Link {...props} to="/settings" />}
              >
                <CogIcon />
              </Button>
            </ToolbarItem>
            <ToolbarItem>
              <Button
                aria-label="Help actions"
                variant={ButtonVariant.plain}
                component={(props): React.ReactElement => (
                  <a {...props} href="https://kobs.io" target="_blank" rel="noreferrer" />
                )}
              >
                <QuestionCircleIcon />
              </Button>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarGroup>
        {/* eslint-disable-next-line @typescript-eslint/naming-convention */}
        {/* <ToolbarItem visibility={{ '2xl': 'hidden', default: 'visible', lg: 'hidden', md: 'hidden', xl: 'hidden' }}>
          <Dropdown
            isPlain={true}
            position="right"
            toggle={<KebabToggle onToggle={(): void => setIsMobileDrowdownOpen(!isMobileDrowdownOpen)} />}
            isOpen={isMobileDrowdownOpen}
            dropdownItems={mobileDrowdownOpen}
          />
        </ToolbarItem> */}
        {authContext.user.email ? (
          <ToolbarItem visibility={{ default: 'hidden', md: 'visible' }}>
            <Dropdown
              isFullHeight={true}
              position="right"
              isOpen={isProfileDrowdownOpen}
              toggle={
                <DropdownToggle
                  icon={<Avatar src={getProfileImageURL()} alt="Avatar" />}
                  onToggle={(): void => setIsProfileDrowdownOpen(!isProfileDrowdownOpen)}
                >
                  {authContext.user.email}
                </DropdownToggle>
              }
              dropdownItems={[
                // <DropdownItem
                //   key="myprofile"
                //   component={(props): React.ReactElement => <Link {...props} to="/profile" />}
                // >
                //   My profile
                // </DropdownItem>,
                // <DropdownSeparator key="divider" />,
                // <DropdownItem
                //   key="logout"
                //   component={(props): React.ReactElement => <a {...props} href="/api/auth/logout" />}
                // >
                //   Logout
                // </DropdownItem>,
              ]}
            />
          </ToolbarItem>
        ) : null}
      </ToolbarContent>
    </Toolbar>
  );
};

export default HeaderToolbar;
