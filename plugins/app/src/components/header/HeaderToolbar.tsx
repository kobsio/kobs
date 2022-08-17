import {
  Button,
  ButtonVariant,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarGroupVariant,
  ToolbarItem,
} from '@patternfly/react-core';
import React, { useContext, useState } from 'react';
import { BellIcon } from '@patternfly/react-icons/dist/esm/icons/bell-icon';
import { QuestionCircleIcon } from '@patternfly/react-icons/dist/esm/icons/question-circle-icon';

import { AuthContext, IAuthContext } from '../../context/AuthContext';
import { INotificationsContext, NotificationsContext } from '../../context/NotificationsContext';
import HeaderToolbarMobileDropdown from './HeaderToolbarMobileDropdown';
import HeaderToolbarProfileDropdown from './HeaderToolbarProfileDropdown';

interface IHeaderToolbarProps {
  isNotificationDrawerExpanded: boolean;
  setIsNotificationDrawerExpanded: (value: boolean) => void;
}

const HeaderToolbar: React.FunctionComponent<IHeaderToolbarProps> = ({
  isNotificationDrawerExpanded,
  setIsNotificationDrawerExpanded,
}: IHeaderToolbarProps) => {
  const authContext = useContext<IAuthContext>(AuthContext);
  const notificationsContext = useContext<INotificationsContext>(NotificationsContext);
  const [isProfileDrowdownOpen, setIsProfileDrowdownOpen] = useState<boolean>(false);
  const [isMobileDrowdownOpen, setIsMobileDrowdownOpen] = useState<boolean>(false);

  return (
    <Toolbar id="header-toolbar" isFullHeight={true} isStatic={true}>
      <ToolbarContent>
        <ToolbarGroup
          variant={ToolbarGroupVariant['icon-button-group']}
          alignment={{ default: 'alignRight' }}
          spacer={{ default: 'spacerNone', md: 'spacerMd' }}
        >
          {notificationsContext.groups.length > 0 && (
            <ToolbarItem>
              <Button
                aria-label="Notifications"
                variant={ButtonVariant.plain}
                onClick={(): void => setIsNotificationDrawerExpanded(!isNotificationDrawerExpanded)}
              >
                <BellIcon />
              </Button>
            </ToolbarItem>
          )}
          <ToolbarGroup
            variant={ToolbarGroupVariant['icon-button-group']}
            visibility={{ default: 'hidden', lg: 'visible' }}
          >
            <ToolbarItem>
              <Button
                aria-label="Help actions"
                variant={ButtonVariant.plain}
                component={(props): React.ReactElement => (
                  // eslint-disable-next-line jsx-a11y/anchor-has-content
                  <a {...props} href="https://kobs.io" target="_blank" rel="noreferrer" />
                )}
              >
                <QuestionCircleIcon />
              </Button>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarGroup>
        {/* eslint-disable-next-line @typescript-eslint/naming-convention */}
        <ToolbarItem visibility={{ '2xl': 'hidden', default: 'visible', lg: 'hidden', md: 'hidden', xl: 'hidden' }}>
          <HeaderToolbarMobileDropdown isOpen={isMobileDrowdownOpen} setIsOpen={setIsMobileDrowdownOpen} />
        </ToolbarItem>
        {authContext.user.email ? (
          <ToolbarItem visibility={{ default: 'hidden', md: 'visible' }}>
            <HeaderToolbarProfileDropdown isOpen={isProfileDrowdownOpen} setIsOpen={setIsProfileDrowdownOpen} />
          </ToolbarItem>
        ) : null}
      </ToolbarContent>
    </Toolbar>
  );
};

export default HeaderToolbar;
