import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import React from 'react';

import Details from './details/Details';
import { IApplication } from '../../utils/interfaces';
import { LinkWrapper } from '@kobsio/plugin-core';

interface IApplicationsGalleryItemProps {
  application: IApplication;
  showDetails?: (details: React.ReactNode) => void;
}

// ApplicationsGalleryItem renders a single application in a Card component. With the title of the application and the
// description of the application. If the user doesn't provide a description, we just show the namespace and cluster of
// the application in the card body.
const ApplicationsGalleryItem: React.FunctionComponent<IApplicationsGalleryItemProps> = ({
  application,
  showDetails,
}: IApplicationsGalleryItemProps) => {
  const cardBody = (
    <CardBody>
      {application.description ? application.description : `${application.namespace} (${application.cluster})`}
    </CardBody>
  );

  // If the component is used withour a selectApplication function we wrap the card inside our LinkWrapper component, so
  // that the user is redirected to the application page, when he selects the card. This is done, so that we can use the
  // same component for the applications gallery view, where the application should be shown in the drawer and the teams
  // view, where the user should be redirected to the applications page.
  if (!showDetails) {
    return (
      <LinkWrapper link={`/applications/${application.cluster}/${application.namespace}/${application.name}`}>
        <Card isHoverable={true}>
          <CardTitle>{application.name}</CardTitle>
          {cardBody}
        </Card>
      </LinkWrapper>
    );
  }

  return (
    <Card
      style={{ cursor: 'pointer' }}
      isHoverable={true}
      onClick={(): void =>
        showDetails(<Details application={application} close={(): void => showDetails(undefined)} />)
      }
    >
      <CardTitle>{application.name}</CardTitle>
      {cardBody}
    </Card>
  );
};

export default ApplicationsGalleryItem;
