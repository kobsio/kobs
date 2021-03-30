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
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { ClustersPromiseClient, GetApplicationsRequest, GetApplicationsResponse } from 'proto/clusters_grpc_web_pb';
import { Application } from 'proto/application_pb';
import ApplicationDetails from 'components/applications/ApplicationDetails';
import ApplicationGallery from 'components/applications/ApplicationGallery';
import ApplicationsToolbar from 'components/applications/ApplicationsToolbar';
import { apiURL } from 'utils/constants';
import { applicationsDescription } from 'utils/constants';

// getDataFromSearch returns the clusters and namespaces for the state from a given search location.
export const getDataFromSearch = (search: string): IDataState => {
  const params = new URLSearchParams(search);
  const clusters = params.getAll('cluster');
  const namespaces = params.getAll('namespace');

  return {
    applications: [],
    clusters: clusters,
    error: '',
    namespaces: namespaces,
  };
};

// clustersService is the Clusters gRPC service, which is used to get a list of resources.
const clustersService = new ClustersPromiseClient(apiURL, null, null);

export interface IDataState {
  applications: Application.AsObject[];
  clusters: string[];
  error: string;
  namespaces: string[];
}

// Applications is the page to display a list of selected applications. To get the applications the user can select a
// list of clusters and namespaces.
const Applications: React.FunctionComponent = () => {
  const history = useHistory();
  const location = useLocation();
  const [data, setData] = useState<IDataState>(getDataFromSearch(location.search));
  const [selectedApplication, setSelectedApplication] = useState<Application.AsObject | undefined>(undefined);

  // changeData is used to set the provided list of clusters and namespaces as query parameters for the current URL, so
  // that a user can share his search with other users.
  const changeData = (clusters: string[], namespaces: string[]): void => {
    const c = clusters.map((cluster) => `&cluster=${cluster}`);
    const n = namespaces.map((namespace) => `&namespace=${namespace}`);

    history.push({
      pathname: location.pathname,
      search: `?${c.length > 0 ? c.join('') : ''}${n.length > 0 ? n.join('') : ''}`,
    });
  };

  // fetchApplications is used to fetch a list of applications. To get the list of applications the user has to select
  // a list of clusters and namespaces.
  const fetchApplications = useCallback(async (d: IDataState) => {
    try {
      if (d.clusters.length > 0 && d.namespaces.length > 0) {
        const getApplicationsRequest = new GetApplicationsRequest();
        getApplicationsRequest.setClustersList(d.clusters);
        getApplicationsRequest.setNamespacesList(d.namespaces);

        const getApplicationsResponse: GetApplicationsResponse = await clustersService.getApplications(
          getApplicationsRequest,
          null,
        );

        setData({
          applications: getApplicationsResponse.toObject().applicationsList,
          clusters: d.clusters,
          error: '',
          namespaces: d.namespaces,
        });
      } else {
        setData({
          applications: [],
          clusters: d.clusters,
          error: '',
          namespaces: d.namespaces,
        });
      }
    } catch (err) {
      setData({
        applications: [],
        clusters: d.clusters,
        error: err.message,
        namespaces: d.namespaces,
      });
    }
  }, []);

  // useEffect is used to trigger the fetchApplications function, everytime the location.search parameter changes.
  useEffect(() => {
    fetchApplications(getDataFromSearch(location.search));
  }, [location.search, fetchApplications]);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          Applications
        </Title>
        <p>{applicationsDescription}</p>
        <ApplicationsToolbar clusters={data.clusters} namespaces={data.namespaces} changeData={changeData} />
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
            <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
              {data.clusters.length === 0 || data.namespaces.length === 0 ? (
                <Alert variant={AlertVariant.info} title="Select clusters and namespaces">
                  <p>Select a list of clusters and namespaces from the toolbar.</p>
                </Alert>
              ) : data.error ? (
                <Alert variant={AlertVariant.danger} title="Applications were not fetched">
                  <p>{data.error}</p>
                </Alert>
              ) : (
                <ApplicationGallery applications={data.applications} selectApplication={setSelectedApplication} />
              )}
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default Applications;
