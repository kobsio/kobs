import {
  Avatar,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  Gallery,
  GalleryItem,
  PageSection,
  PageSectionVariants,
  Title,
} from '@patternfly/react-core';
import React from 'react';

import { LinkWrapper } from '@kobsio/plugin-core';
import { services } from '../../utils/services';

interface IOverviewPageProps {
  name: string;
  displayName: string;
  description: string;
}

const OverviewPage: React.FunctionComponent<IOverviewPageProps> = ({
  name,
  displayName,
  description,
}: IOverviewPageProps) => {
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
              <Gallery hasGutter={true}>
                {Object.keys(services).map((service) => (
                  <GalleryItem key={service}>
                    <LinkWrapper link={`/${name}/${service}`}>
                      <Card style={{ cursor: 'pointer' }} isHoverable={true}>
                        <CardHeader>
                          <Avatar
                            src={services[service].icon}
                            alt={services[service].name}
                            style={{ height: '27px', marginRight: '5px', width: '27px' }}
                          />
                          <CardTitle>{services[service].name}</CardTitle>
                        </CardHeader>
                        <CardBody>{services[service].description}</CardBody>
                      </Card>
                    </LinkWrapper>
                  </GalleryItem>
                ))}
              </Gallery>
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default OverviewPage;
