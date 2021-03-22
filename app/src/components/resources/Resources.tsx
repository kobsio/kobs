import {
  Alert,
  AlertVariant,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  PageSection,
  PageSectionVariants,
  Title,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import { IRow } from '@patternfly/react-table';

import { Resources as IApplicationResources } from 'proto/application_pb';
import ResourceDetails from 'components/resources/ResourceDetails';
import ResourcesList from 'components/resources/ResourcesList';
import ResourcesToolbar from 'components/resources/ResourcesToolbar';
import { resourcesDescription } from 'utils/constants';

export interface IResources {
  clusters: string[];
  resources: IApplicationResources.AsObject[];
  namespaces: string[];
}

// Resources is the the component for the resources page. The user can select a list of clusters, resources and
// namespaces he wants to retrieve from the toolbar. The resources are then displayed in a list of tables.
const Resources: React.FunctionComponent = () => {
  const [resources, setResources] = useState<IResources | undefined>(undefined);
  const [selectedResource, setSelectedResource] = useState<IRow | undefined>(undefined);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          Resources
        </Title>
        <p>{resourcesDescription}</p>
        <ResourcesToolbar setResources={setResources} />
      </PageSection>

      <Drawer isExpanded={selectedResource !== undefined}>
        <DrawerContent
          panelContent={
            selectedResource ? (
              <ResourceDetails resource={selectedResource} close={(): void => setSelectedResource(undefined)} />
            ) : undefined
          }
        >
          <DrawerContentBody>
            <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
              {!resources ? (
                <Alert variant={AlertVariant.info} title="Select clusters, resources and namespaces">
                  <p>Select a list of clusters, resources and namespaces from the toolbar.</p>
                </Alert>
              ) : resources.clusters.length === 0 ||
                resources.namespaces.length === 0 ||
                resources.resources.length === 0 ? (
                <Alert variant={AlertVariant.danger} title="Select clusters, resources and namespaces">
                  <p>
                    You have to select a minimum of one cluster, resource and namespace from the toolbar to search for
                    resources.
                  </p>
                </Alert>
              ) : (
                <ResourcesList resources={resources} selectResource={setSelectedResource} />
              )}
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default Resources;
