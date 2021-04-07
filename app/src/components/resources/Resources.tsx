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
import React, { useContext, useState } from 'react';
import { IRow } from '@patternfly/react-table';

import { ClustersContext, IClusterContext } from 'context/ClustersContext';
import { Resources as IApplicationResources } from 'proto/application_pb';
import { IResources as IClustersContextResources } from 'utils/resources';
import ResourceDetails from 'components/resources/ResourceDetails';
import ResourcesList from 'components/resources/ResourcesList';
import ResourcesToolbar from 'components/resources/ResourcesToolbar';
import { resourcesDescription } from 'utils/constants';

// checkRequiredData checks if the given resources object contains all data, so that we can passed it to the
// ResourcesList component and show the list of resources. We can only pass the object to the component, when it
// contains a cluster and a resource. Further we also need a namespace, when the list of resource contains a namespaced
// resource. When the list only contains cluster scoped resources the user must not enter a namespace.
const checkRequiredData = (
  resources: IResources,
  clustersContextResources: IClustersContextResources | undefined,
): boolean => {
  if (!resources || resources.clusters.length === 0 || resources.resources.length !== 1 || !clustersContextResources) {
    return false;
  }

  let namespacedOnly = true;
  for (let i = 0; i < resources.resources[0].kindsList.length; i++) {
    if (
      clustersContextResources.hasOwnProperty(resources.resources[0].kindsList[i]) &&
      clustersContextResources[resources.resources[0].kindsList[i]].scope === 'Namespaced'
    ) {
      namespacedOnly = false;
    }
  }

  if (!namespacedOnly && resources.resources[0].namespacesList.length === 0) {
    return false;
  }

  return true;
};

export interface IResources {
  clusters: string[];
  resources: IApplicationResources.AsObject[];
}

// Resources is the the component for the resources page. The user can select a list of clusters, resources and
// namespaces he wants to retrieve from the toolbar. The resources are then displayed in a list of tables.
const Resources: React.FunctionComponent = () => {
  const clustersContext = useContext<IClusterContext>(ClustersContext);
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
              {!resources || !checkRequiredData(resources, clustersContext.resources) ? (
                <Alert variant={AlertVariant.info} title="Select clusters, resources and namespaces">
                  <p>Select a list of clusters, resources and namespaces from the toolbar.</p>
                </Alert>
              ) : (
                <ResourcesList defaultNamespaces={[]} resources={resources} selectResource={setSelectedResource} />
              )}
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default Resources;
