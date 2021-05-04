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
import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
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

// getResourcesFromSearch returns the clusters, namespaces, kind and selector for the resources state from a given
// search location.
export const getResourcesFromSearch = (search: string): IResources => {
  const params = new URLSearchParams(search);
  const clusters = params.getAll('cluster');
  const namespaces = params.getAll('namespace');
  const kinds = params.getAll('kind');
  const selector = params.get('selector');

  return {
    clusters: clusters,
    resources: [
      {
        kindsList: kinds,
        namespacesList: namespaces,
        selector: selector ? selector : '',
      },
    ],
  };
};

export interface IResources {
  clusters: string[];
  resources: IApplicationResources.AsObject[];
}

// Resources is the the component for the resources page. The user can select a list of clusters, resources and
// namespaces he wants to retrieve from the toolbar. The resources are then displayed in a list of tables.
const Resources: React.FunctionComponent = () => {
  const history = useHistory();
  const location = useLocation();
  const clustersContext = useContext<IClusterContext>(ClustersContext);
  const [resources, setResources] = useState<IResources>(getResourcesFromSearch(location.search));
  const [selectedResource, setSelectedResource] = useState<IRow | undefined>(undefined);

  // changeResources is used to set the provided resources as query parameters in the current URL. This used, so that a
  // user can share the URL of his view with other users.
  const changeResources = (res: IResources): void => {
    if (res.resources.length === 1) {
      const c = res.clusters.map((cluster) => `&cluster=${cluster}`);
      const n = res.resources[0].namespacesList.map((namespace) => `&namespace=${namespace}`);
      const k = res.resources[0].kindsList.map((kind) => `&kind=${kind}`);

      history.push({
        pathname: location.pathname,
        search: `?selector=${res.resources[0].selector}${c.length > 0 ? c.join('') : ''}${
          n.length > 0 ? n.join('') : ''
        }${k.length > 0 ? k.join('') : ''}`,
      });
    }
  };

  // useEffect is used to change the resources state everytime the location.search parameter changes.
  useEffect(() => {
    setResources(getResourcesFromSearch(location.search));
  }, [location.search]);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          Resources
        </Title>
        <p>{resourcesDescription}</p>
        <ResourcesToolbar resources={resources} setResources={changeResources} />
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
