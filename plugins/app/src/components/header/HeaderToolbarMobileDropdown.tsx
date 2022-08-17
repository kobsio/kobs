import { Dropdown, DropdownItem, DropdownSeparator, KebabToggle } from '@patternfly/react-core';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { QuestionCircleIcon } from '@patternfly/react-icons/dist/esm/icons/question-circle-icon';

import { AuthContext, IAuthContext } from '../../context/AuthContext';
import HeaderToolbarSignout from './HeaderToolbarSignout';

interface IHeaderToolbarMobileDropdownProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const HeaderToolbarMobileDropdown: React.FunctionComponent<IHeaderToolbarMobileDropdownProps> = ({
  isOpen,
  setIsOpen,
}: IHeaderToolbarMobileDropdownProps) => {
  const authContext = useContext<IAuthContext>(AuthContext);

  if (authContext.user.email) {
    return (
      <Dropdown
        isPlain={true}
        position="right"
        toggle={<KebabToggle onToggle={(): void => setIsOpen(!isOpen)} />}
        isOpen={isOpen}
        dropdownItems={[
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          <DropdownItem key="myprofile" component={(props): React.ReactNode => <Link {...props} to="/profile" />}>
            My profile
          </DropdownItem>,
          <DropdownSeparator key="divider1" />,
          <HeaderToolbarSignout key="signout" />,
          <DropdownSeparator key="divider2" />,
          <DropdownItem
            key="help"
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            component={(props): React.ReactElement => (
              <a {...props} href="https://kobs.io" target="_blank" rel="noreferrer">
                <QuestionCircleIcon /> Help
              </a>
            )}
          ></DropdownItem>,
        ]}
      />
    );
  }

  return (
    <Dropdown
      isPlain={true}
      position="right"
      toggle={<KebabToggle onToggle={(): void => setIsOpen(!isOpen)} />}
      isOpen={isOpen}
      dropdownItems={[
        <DropdownItem
          key="help"
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          component={(props): React.ReactElement => (
            <a {...props} href="https://kobs.io" target="_blank" rel="noreferrer">
              <QuestionCircleIcon /> Help
            </a>
          )}
        ></DropdownItem>,
      ]}
    />
  );
};

export default HeaderToolbarMobileDropdown;
