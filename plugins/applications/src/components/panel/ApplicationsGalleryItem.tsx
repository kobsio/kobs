import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import React from 'react';

import { IPluginTimes, LinkWrapper, PluginPreview } from '@kobsio/plugin-core';
import Details from './details/Details';
import { IApplication } from '../../utils/interfaces';

interface IApplicationsGalleryItemProps {
  times: IPluginTimes;
  application: IApplication;
  showDetails?: (details: React.ReactNode) => void;
}

// ApplicationsGalleryItem renders a single application in a Card component. With the title of the application and the
// description of the application. If the user doesn't provide a description, we just show the namespace and cluster of
// the application in the card body.
const ApplicationsGalleryItem: React.FunctionComponent<IApplicationsGalleryItemProps> = ({
  times,
  application,
  showDetails,
}: IApplicationsGalleryItemProps) => {
  const cardBody = (
    <CardBody style={{ height: '150px', maxHeight: '150px', minHeight: '150px' }}>
      {application.preview ? (
        <div style={{ height: '124px', overflow: 'hidden' }}>
          <PluginPreview
            times={times}
            title={application.preview.title}
            name={application.preview.plugin.name}
            options={application.preview.plugin.options}
          />
        </div>
      ) : application.description ? (
        <div style={{ height: '124px', overflow: 'scroll' }}>{application.description}</div>
      ) : (
        <div style={{ height: '124px', overflow: 'scroll' }}>
          `${application.namespace} (${application.cluster})`
        </div>
      )}
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
