import { CardBody, CardTitle, Card as PatternflyCard } from '@patternfly/react-core';
import React from 'react';

import { Application } from 'generated/proto/applications_pb';

interface ICardProps {
  application: Application;
  select: (application: Application) => void;
}

// Card displays a single application within the Applications gallery. The component requires the application and a
// select function as props. The select function is called, when the user clicks on the card. In the applications pages,
// this will then open the drawer with the selected application.
const Card: React.FunctionComponent<ICardProps> = ({ application, select }: ICardProps) => {
  return (
    <PatternflyCard isSelectable={true} onClick={(): void => select(application)}>
      <CardTitle>{application.getName()}</CardTitle>
      <CardBody>
        {application.getCluster()} {application.getNamespace()}
      </CardBody>
    </PatternflyCard>
  );
};

export default Card;
