import { Gallery, GalleryItem, PageSection, PageSectionVariants } from '@patternfly/react-core';
import React from 'react';

import { applicationsDescription, resourcesDescription } from 'utils/constants';
import HomeItem from 'components/HomeItem';

// Home is the root component of kobs. It is used to render a list of pages, which can be used by the user. The items
// which are displayed to the user are the applications and resources page and a list of all configured plugins.
// The items for the gallery should always use the HomeItem component, this will render a card, which are selectable. By
// a click on the item the user is navigated to the corresponding page.
const Home: React.FunctionComponent = () => {
  return (
    <PageSection variant={PageSectionVariants.default}>
      <Gallery hasGutter={true}>
        <GalleryItem>
          <HomeItem title="Applications" body={applicationsDescription} link="/applications" />
        </GalleryItem>
        <GalleryItem>
          <HomeItem title="Resources" body={resourcesDescription} link="/resources" />
        </GalleryItem>
      </Gallery>
    </PageSection>
  );
};

export default Home;
