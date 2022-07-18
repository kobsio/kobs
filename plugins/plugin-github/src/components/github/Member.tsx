import { Avatar, FlexItem } from '@patternfly/react-core';
import React from 'react';

import { LinkWrapper } from '@kobsio/shared';

interface IMemberProps {
  login: string;
  url: string;
  avatar: string;
}

const Member: React.FunctionComponent<IMemberProps> = ({ login, url, avatar }: IMemberProps) => {
  return (
    <LinkWrapper to={url}>
      <FlexItem style={{ cursor: 'pointer' }}>
        <Avatar src={avatar} alt={login} />
      </FlexItem>
    </LinkWrapper>
  );
};

export default Member;
