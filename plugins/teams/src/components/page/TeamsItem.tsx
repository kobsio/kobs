import { Avatar, Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import React from 'react';

import { LinkWrapper } from '@kobsio/plugin-core';
import teamsIcon from '../../assets/icon.png';

interface ITeamsItemProps {
  cluster: string;
  namespace: string;
  name: string;
  description?: string;
  logo?: string;
}

// TeamsItem renders a single team in a Card component. The Card is wrapped by our LinkWrapper so that the user is
// redirected to the page of the team, when he clicks on the card.
const TeamsItem: React.FunctionComponent<ITeamsItemProps> = ({
  cluster,
  namespace,
  name,
  description,
  logo,
}: ITeamsItemProps) => {
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

export default TeamsItem;
