import { DropdownItem } from '@patternfly/react-core';
import React from 'react';

const HeaderToolbarSignout: React.FunctionComponent = () => {
  const signout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/signout', {
        method: 'get',
      });
      window.location.replace('/');
    } catch (err) {
      window.location.replace('/');
    }
  };

  return <DropdownItem onClick={signout}>Sign out</DropdownItem>;
};

export default HeaderToolbarSignout;
