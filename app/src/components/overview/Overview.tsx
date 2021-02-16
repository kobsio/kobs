import { Divider, Gallery, GalleryItem, PageSection, PageSectionVariants, Title } from '@patternfly/react-core';
import React from 'react';

import Item from './Item';
import { resources } from '../resources/helpers';

const Overview: React.FunctionComponent = () => {
  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.default}>
        <Title headingLevel="h6" size="xl">
          Resources
        </Title>
        <Divider />
      </PageSection>

      <PageSection variant={PageSectionVariants.default}>
        <Gallery hasGutter={true}>
          {Object.keys(resources).map((key) => (
            <GalleryItem key={key}>
              <Item title={resources[key].title} body={resources[key].description} link={`/resources/${key}`} />
            </GalleryItem>
          ))}
        </Gallery>
      </PageSection>
    </React.Fragment>
  );
};

export default Overview;
