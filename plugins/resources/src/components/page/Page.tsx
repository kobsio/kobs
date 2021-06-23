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

import { ClustersContext, IClusterContext, IPluginPageProps, IResources } from '@kobsio/plugin-core';
import { IPanelOptions } from '../../utils/utils';
import PageToolbar from './PageToolbar';
import Panel from '../panel/Panel';

// checkRequiredData checks if the given resources object contains all data, so that we can passed it to the
// ResourcesPanel component and show the list of resources. We can only pass the object to the component, when it
// contains a cluster and a resource. Further we also need a namespace, when the list of resource contains a namespaced
// resource. When the list only contains cluster scoped resources the user must not enter a namespace.
const checkRequiredData = (resources: IPanelOptions, clustersContextResources: IResources | undefined): boolean => {
  if (!resources || resources.clusters.length === 0 || resources.resources.length !== 1 || !clustersContextResources) {
    return false;
  }

  let namespacedOnly = true;
  for (let i = 0; i < resources.resources.length; i++) {
    if (
      clustersContextResources.hasOwnProperty(resources.resources[i]) &&
      clustersContextResources[resources.resources[i]].scope === 'Namespaced'
    ) {
      namespacedOnly = false;
    }
  }

  if (!namespacedOnly && resources.namespaces.length === 0) {
    return false;
  }

  return true;
};

// getResourcesFromSearch returns the clusters, namespaces, resources and selector for the resources state from a given
// search location.
export const getResourcesFromSearch = (search: string): IPanelOptions => {
  const params = new URLSearchParams(search);
  const clusters = params.getAll('cluster');
  const namespaces = params.getAll('namespace');
  const resources = params.getAll('resource');
  const selector = params.get('selector');

  return {
    clusters: clusters,
    namespaces: namespaces,
    resources: resources,
    selector: selector ? selector : '',
  };
};

const Page: React.FunctionComponent<IPluginPageProps> = ({ name, displayName, description }: IPluginPageProps) => {
  const history = useHistory();
  const location = useLocation();
  const clustersContext = useContext<IClusterContext>(ClustersContext);
  const [resources, setResources] = useState<IPanelOptions>(getResourcesFromSearch(location.search));
  const [selectedResource, setSelectedResource] = useState<React.ReactNode>(undefined);

  // changeResources is used to set the provided resources as query parameters in the current URL. This used, so that a
  // user can share the URL of his view with other users.
  const changeResources = (clusters: string[], namespaces: string[], resources: string[], selector: string): void => {
    const clusterParams = clusters.map((cluster) => `&cluster=${cluster}`);
    const namespaceParams = namespaces.map((namespace) => `&namespace=${namespace}`);
    const resourceParams = resources.map((resource) => `&resource=${resource}`);

    history.push({
      pathname: location.pathname,
      search: `?selector=${selector}${clusterParams.length > 0 ? clusterParams.join('') : ''}${
        namespaceParams.length > 0 ? namespaceParams.join('') : ''
      }${resourceParams.length > 0 ? resourceParams.join('') : ''}`,
    });
  };

  // useEffect is used to change the resources state everytime the location.search parameter changes.
  useEffect(() => {
    setResources(getResourcesFromSearch(location.search));
  }, [location.search]);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {displayName}
        </Title>
        <p>{description}</p>
        <PageToolbar resources={resources} setResources={changeResources} />
      </PageSection>

      <Drawer isExpanded={selectedResource !== undefined}>
        <DrawerContent panelContent={selectedResource}>
          <DrawerContentBody>
            <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
              {!resources || !checkRequiredData(resources, clustersContext.resources) ? (
                <Alert variant={AlertVariant.info} title="Select clusters, resources and namespaces">
                  <p>Select a list of clusters, resources and namespaces from the toolbar.</p>
                </Alert>
              ) : (
                <Panel name={name} title="" options={[resources]} showDetails={setSelectedResource} />
              )}
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default Page;
