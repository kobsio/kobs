import { Gallery, GalleryItem } from '@patternfly/react-core';
import React from 'react';

import { Application } from 'proto/application_pb';
import ApplicationDetails from 'components/applications/ApplicationDetails';
import ApplicationsItem from 'components/applications/ApplicationsItem';

interface ITeamApplicationsProps {
  applications: Application.AsObject[];
  selectApplication: (details: React.ReactNode) => void;
}

const TeamApplications: React.FunctionComponent<ITeamApplicationsProps> = ({
  applications,
  selectApplication,
}: ITeamApplicationsProps) => {
  return (
    <Gallery hasGutter={true}>
      {applications.map((application, index) => (
        <GalleryItem key={index}>
          <ApplicationsItem
            application={application}
            selectApplication={(application): void =>
              selectApplication(
                <ApplicationDetails application={application} close={(): void => selectApplication(undefined)} />,
              )
            }
          />
        </GalleryItem>
      ))}
    </Gallery>
  );
};

export default TeamApplications;
