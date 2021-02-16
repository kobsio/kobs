import { Gallery, GalleryItem, PageSection, PageSectionVariants } from '@patternfly/react-core';
import React from 'react';

const Applications: React.FunctionComponent = () => {
  return (
    <PageSection variant={PageSectionVariants.default}>
      <Gallery hasGutter={true}>
        <GalleryItem>Applications</GalleryItem>
      </Gallery>
    </PageSection>
  );
};

export default Applications;
