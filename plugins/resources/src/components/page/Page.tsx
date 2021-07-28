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
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { IPanelOptions } from '../../utils/interfaces';
import { IPluginPageProps } from '@kobsio/plugin-core';
import PageToolbar from './PageToolbar';
import Panel from '../panel/Panel';

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
              {!resources ? (
                <Alert variant={AlertVariant.info} title="Select clusters, resources and namespaces">
                  <p>Select a list of clusters, resources and namespaces from the toolbar.</p>
                </Alert>
              ) : (
                <Panel
                  defaults={{ cluster: '', name: '', namespace: '' }}
                  name={name}
                  title=""
                  options={[resources]}
                  showDetails={setSelectedResource}
                />
              )}
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default Page;
