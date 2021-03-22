import { Gallery, GalleryItem } from '@patternfly/react-core';
import React from 'react';

import { Application } from 'proto/application_pb';
import ApplicationItem from 'components/applications/ApplicationItem';

interface IApplicationGalleryProps {
  applications: Application.AsObject[];
  selectApplication: (application: Application.AsObject) => void;
}

// ApplicationGallery is the component to display all applications inside a gallery view.
const ApplicationGallery: React.FunctionComponent<IApplicationGalleryProps> = ({
  applications,
  selectApplication,
}: IApplicationGalleryProps) => {
  return (
    <Gallery hasGutter={true}>
      {applications.map((application, index) => (
        <GalleryItem key={index}>
          <ApplicationItem application={application} selectApplication={selectApplication} />
        </GalleryItem>
      ))}
    </Gallery>
  );
};

export default ApplicationGallery;
