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

import { Application } from 'proto/application_pb';
import ApplicationDetails from 'components/applications/ApplicationDetails';
import ApplicationsGallery from 'components/applications/ApplicationsGallery';
import ApplicationsToolbar from 'components/applications/ApplicationsToolbar';
import ApplicationsTopology from 'components/applications/ApplicationsTopology';
import { applicationsDescription } from 'utils/constants';

interface IDataState {
  clusters: string[];
  namespaces: string[];
  view: string;
}

// getDataFromSearch returns the clusters and namespaces for the state from a given search location.
export const getDataFromSearch = (search: string): IDataState => {
  const params = new URLSearchParams(search);
  const clusters = params.getAll('cluster');
  const namespaces = params.getAll('namespace');
  const view = params.get('view');

  return {
    clusters: clusters,
    namespaces: namespaces,
    view: view ? view : 'gallery',
  };
};

// Applications is the page to display a list of selected applications. To get the applications the user can select a
// list of clusters and namespaces. The applications can be displayed in a gallery view or in a topology view.
const Applications: React.FunctionComponent = () => {
  const history = useHistory();
  const location = useLocation();
  const [data, setData] = useState<IDataState>(getDataFromSearch(location.search));
  const [selectedApplication, setSelectedApplication] = useState<Application.AsObject | undefined>(undefined);

  // changeData is used to set the provided list of clusters and namespaces as query parameters for the current URL, so
  // that a user can share his search with other users.
  const changeData = (clusters: string[], namespaces: string[], view: string): void => {
    const c = clusters.map((cluster) => `&cluster=${cluster}`);
    const n = namespaces.map((namespace) => `&namespace=${namespace}`);

    history.push({
      pathname: location.pathname,
      search: `?view=${view}${c.length > 0 ? c.join('') : ''}${n.length > 0 ? n.join('') : ''}`,
    });
  };

  // useEffect is used to change the data state everytime the location.search parameter changes.
  useEffect(() => {
    setData(getDataFromSearch(location.search));
  }, [location.search]);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          Applications
        </Title>
        <p>{applicationsDescription}</p>
        <ApplicationsToolbar
          clusters={data.clusters}
          namespaces={data.namespaces}
          view={data.view}
          changeData={changeData}
        />
      </PageSection>

      <Drawer isExpanded={selectedApplication !== undefined}>
        <DrawerContent
          panelContent={
            selectedApplication ? (
              <ApplicationDetails
                application={selectedApplication}
                close={(): void => setSelectedApplication(undefined)}
              />
            ) : undefined
          }
        >
          <DrawerContentBody>
            <PageSection
              style={data.view === 'topology' ? { height: '100%', minHeight: '100%' } : { minHeight: '100%' }}
              variant={PageSectionVariants.default}
            >
              {data.clusters.length === 0 || data.namespaces.length === 0 ? (
                <Alert variant={AlertVariant.info} title="Select clusters and namespaces">
                  <p>Select a list of clusters and namespaces from the toolbar.</p>
                </Alert>
              ) : data.view === 'topology' ? (
                <ApplicationsTopology
                  clusters={data.clusters}
                  namespaces={data.namespaces}
                  selectApplication={setSelectedApplication}
                />
              ) : (
                <ApplicationsGallery
                  clusters={data.clusters}
                  namespaces={data.namespaces}
                  selectApplication={setSelectedApplication}
                />
              )}
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default Applications;
