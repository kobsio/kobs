import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import React from 'react';

import LinkWrapper from 'components/LinkWrapper';

interface ITeamsItemProps {
  description: string;
  logo: string;
  name: string;
}

// TeamsItem renders a single team in a Card component. The Card is wrapped by our LinkWrapper so that the user is
// redirected to the page of the team, when he clicks on the card.
const TeamsItem: React.FunctionComponent<ITeamsItemProps> = ({ description, logo, name }: ITeamsItemProps) => {
  return (
    <LinkWrapper link={`/teams/${name}`}>
      <Card style={{ cursor: 'pointer' }} isHoverable={true}>
        <CardHeader>
          <img src={logo} alt={name} width="27px" style={{ marginRight: '5px' }} />
          <CardTitle>{name}</CardTitle>
        </CardHeader>
        <CardBody>{description}</CardBody>
      </Card>
    </LinkWrapper>
  );
};

export default TeamsItem;
