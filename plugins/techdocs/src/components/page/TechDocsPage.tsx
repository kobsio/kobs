import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
  PageSection,
  PageSectionVariants,
  Title,
} from '@patternfly/react-core';
import React from 'react';

import TechDocsList from '../panel/TechDocsList';

interface ITechDocsPageProps {
  name: string;
  displayName: string;
  description: string;
}

const TechDocsPage: React.FunctionComponent<ITechDocsPageProps> = ({
  name,
  displayName,
  description,
}: ITechDocsPageProps) => {
  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {displayName}
        </Title>
        <p>{description}</p>
      </PageSection>

      <Drawer isExpanded={false}>
        <DrawerContent panelContent={undefined}>
          <DrawerContentBody>
            <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
              <TechDocsList name={name} />
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default TechDocsPage;
