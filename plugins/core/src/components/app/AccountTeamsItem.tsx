import { Avatar, Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import React from 'react';

import { LinkWrapper } from '../misc/LinkWrapper';
import teamsIcon from '../../assets/teamsIcon.png';

interface IAccountTeamsItemProps {
  cluster: string;
  namespace: string;
  name: string;
  description?: string;
  logo?: string;
}

const AccountTeamsItem: React.FunctionComponent<IAccountTeamsItemProps> = ({
  cluster,
  namespace,
  name,
  description,
  logo,
}: IAccountTeamsItemProps) => {
  let teamLogo = logo;

  if (!teamLogo) {
    teamLogo = teamsIcon;
  }

  return (
    <LinkWrapper link={`/teams/${cluster}/${namespace}/${name}`}>
      <Card style={{ cursor: 'pointer' }} isHoverable={true}>
        <CardHeader>
          <Avatar src={teamLogo} alt={name} style={{ height: '27px', marginRight: '5px', width: '27px' }} />
          <CardTitle>{name}</CardTitle>
        </CardHeader>
        <CardBody>{description}</CardBody>
      </Card>
    </LinkWrapper>
  );
};

export default AccountTeamsItem;
