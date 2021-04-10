import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import React from 'react';

import { Application } from 'proto/application_pb';
import LinkWrapper from 'components/LinkWrapper';
import Preview from 'components/plugins/Preview';

interface IApplicationsItemProps {
  application: Application.AsObject;
  selectApplication?: (application: Application.AsObject) => void;
}

// ApplicationsItem renders a single application in a Card component. With the title of the application and the
// description of the application. If the user doesn't provide a description, we just show the namespace and cluster of
// the application in the card body.
const ApplicationsItem: React.FunctionComponent<IApplicationsItemProps> = ({
  application,
  selectApplication,
}: IApplicationsItemProps) => {
  const card = (
    <Card
      style={{ cursor: 'pointer' }}
      isHoverable={true}
      onClick={selectApplication ? (): void => selectApplication(application) : undefined}
    >
      <CardTitle>{application.name}</CardTitle>
      <CardBody>
        {application.details && application.details.plugin ? (
          <Preview plugin={application.details.plugin} />
        ) : application.details ? (
          application.details.description
        ) : (
          `${application.namespace} (${application.cluster})`
        )}
      </CardBody>
    </Card>
  );

  // If the component is used withour a selectApplication function we wrap the card inside our LinkWrapper component, so
  // that the user is redirected to the application page, when he selects the card. This is done, so that we can use the
  // same component for the applications gallery view, where the application should be shown in the drawer and the teams
  // view, where the user should be redirected to the applications page.
  if (!selectApplication) {
    return (
      <LinkWrapper link={`/applications/${application.cluster}/${application.namespace}/${application.name}`}>
        {card}
      </LinkWrapper>
    );
  }

  return card;
};

export default ApplicationsItem;
