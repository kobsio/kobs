import { Divider, Gallery, GalleryItem, PageSection, PageSectionVariants, Title } from '@patternfly/react-core';
import React from 'react';

import { applicationsDescription, datasourcesDescription } from 'utils/constants';
import Item from 'components/overview/gallery/Item';
import { resources } from 'components/resources/shared/helpers';

// Overview is the root component of kobs. It is used to render a list of pages, which can be used by the user. The
// items for the resources are generated with the help of all defined resources from the resouces/helpers file.
// The items for the gallery should always use the Item component, this will render a card, which are selectable. By a
// click on the item the user is navigated to the corresponding page.
const Overview: React.FunctionComponent = () => {
  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.default}>
        <Title headingLevel="h6" size="xl">
          Applications
        </Title>
        <Divider />
      </PageSection>

      <PageSection variant={PageSectionVariants.default}>
        <Gallery hasGutter={true}>
          <GalleryItem>
            <Item title="Applications" body={applicationsDescription} link="/applications" />
          </GalleryItem>
          <GalleryItem>
            <Item title="Datasources" body={datasourcesDescription} link="/datasources" />
          </GalleryItem>
        </Gallery>
      </PageSection>

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
