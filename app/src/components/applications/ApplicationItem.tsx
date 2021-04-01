import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import React from 'react';

import { Application } from 'proto/application_pb';
import Preview from 'components/plugins/Preview';

interface IApplicationItemProps {
  application: Application.AsObject;
  selectApplication: (application: Application.AsObject) => void;
}

// ApplicationItem renders a single application in a Card component. With the title of the application and the
// description of the application. If the user doesn't provide a description, we just show the namespace and cluster of
// the application in the card body.
const ApplicationItem: React.FunctionComponent<IApplicationItemProps> = ({
  application,
  selectApplication,
}: IApplicationItemProps) => {
  return (
    <Card style={{ cursor: 'pointer' }} isHoverable={true} onClick={(): void => selectApplication(application)}>
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
};

export default ApplicationItem;
