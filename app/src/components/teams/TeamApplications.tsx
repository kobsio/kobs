import { Gallery, GalleryItem } from '@patternfly/react-core';
import React from 'react';

import { Application } from 'proto/application_pb';
import ApplicationsItem from 'components/applications/ApplicationsItem';

interface ITeamApplicationsProps {
  applications: Application.AsObject[];
}

const TeamApplications: React.FunctionComponent<ITeamApplicationsProps> = ({
  applications,
}: ITeamApplicationsProps) => {
  return (
    <Gallery hasGutter={true}>
      {applications.map((application, index) => (
        <GalleryItem key={index}>
          <ApplicationsItem application={application} />
        </GalleryItem>
      ))}
    </Gallery>
  );
};

export default TeamApplications;
