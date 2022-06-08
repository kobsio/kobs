import { Avatar, Card, CardBody, CardHeader, CardTitle, Gallery, GalleryItem } from '@patternfly/react-core';
import React from 'react';

import { IPluginInstance, LinkWrapper, PageContentSection, PageHeaderSection, PluginPageTitle } from '@kobsio/shared';
import { defaultDescription } from '../../utils/constants';
import { services } from '../../utils/services';

interface IOverviewPageProps {
  instance: IPluginInstance;
}

const OverviewPage: React.FunctionComponent<IOverviewPageProps> = ({ instance }: IOverviewPageProps) => {
  return (
    <React.Fragment>
      <PageHeaderSection
        component={
          <PluginPageTitle
            satellite={instance.satellite}
            name={instance.name}
            description={instance.description || defaultDescription}
          />
        }
      />

      <PageContentSection hasPadding={true} toolbarContent={undefined} panelContent={undefined}>
        <Gallery hasGutter={true}>
          {Object.keys(services).map((service) => (
            <GalleryItem key={service}>
              <LinkWrapper to={`/plugins/${instance.satellite}/${instance.type}/${instance.name}/${service}`}>
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
      </PageContentSection>
    </React.Fragment>
  );
};

export default OverviewPage;
