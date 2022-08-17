import { Avatar, Dropdown, DropdownItem, DropdownSeparator, DropdownToggle } from '@patternfly/react-core';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import md5 from 'md5';

import { AuthContext, IAuthContext } from '../../context/AuthContext';
import HeaderToolbarSignout from './HeaderToolbarSignout';

interface IHeaderToolbarProfileDropdownProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const HeaderToolbarProfileDropdown: React.FunctionComponent<IHeaderToolbarProfileDropdownProps> = ({
  isOpen,
  setIsOpen,
}: IHeaderToolbarProfileDropdownProps) => {
  const authContext = useContext<IAuthContext>(AuthContext);

  const getProfileImageURL = (): string => {
    return (
      'https://secure.gravatar.com/avatar/' + md5(authContext.user.email.toLowerCase().trim()) + '?size=64&default=mm'
    );
  };

  return (
    <Dropdown
      isFullHeight={true}
      position="right"
      isOpen={isOpen}
      toggle={
        <DropdownToggle
          icon={<Avatar src={getProfileImageURL()} alt="Avatar" />}
          onToggle={(): void => setIsOpen(!isOpen)}
        >
          {authContext.user.email}
        </DropdownToggle>
      }
      dropdownItems={[
        <DropdownItem
          key="myprofile"
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          component={(props): React.ReactElement => <Link {...props} to="/profile" />}
        >
          My profile
        </DropdownItem>,
        <DropdownSeparator key="divider" />,
        <HeaderToolbarSignout key="signout" />,
      ]}
    />
  );
};

export default HeaderToolbarProfileDropdown;
