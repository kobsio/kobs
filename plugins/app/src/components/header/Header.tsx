import {
  Brand,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  MastheadToggle,
  PageToggleButton,
} from '@patternfly/react-core';
import BarsIcon from '@patternfly/react-icons/dist/esm/icons/bars-icon';
import React from 'react';

import HeaderToolbar from './HeaderToolbar';

import logo from '../../assets/logo.png';

interface IHeaderProps {
  isNotificationDrawerExpanded: boolean;
  setIsNotificationDrawerExpanded: (value: boolean) => void;
}

const Header: React.FunctionComponent<IHeaderProps> = ({
  isNotificationDrawerExpanded,
  setIsNotificationDrawerExpanded,
}: IHeaderProps) => {
  return (
    <Masthead>
      <MastheadToggle>
        <PageToggleButton variant="plain" aria-label="Global navigation">
          <BarsIcon />
        </PageToggleButton>
      </MastheadToggle>
      <MastheadMain>
        <MastheadBrand component="span">
          <Brand src={logo} alt="kobs logo" />
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>
        <HeaderToolbar
          isNotificationDrawerExpanded={isNotificationDrawerExpanded}
          setIsNotificationDrawerExpanded={setIsNotificationDrawerExpanded}
        />
      </MastheadContent>
    </Masthead>
  );
};

export default Header;
