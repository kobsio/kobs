import { Flex } from '@patternfly/react-core';
import React from 'react';

interface IToolbarProps {
  usePageInsets?: boolean;
  children: React.ReactNode;
}

export const Toolbar: React.FunctionComponent<IToolbarProps> = ({ usePageInsets, children }: IToolbarProps) => {
  return (
    <Flex
      className={usePageInsets ? 'pf-u-pb-md pf-u-pl-lg pf-u-pr-lg' : 'pf-u-pb-md'}
      direction={{ default: 'column', lg: 'row' }}
      style={{ zIndex: 300 }}
    >
      {children}
    </Flex>
  );
};
