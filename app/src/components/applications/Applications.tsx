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

import { ClustersPromiseClient, GetApplicationsRequest, GetApplicationsResponse } from 'proto/clusters_grpc_web_pb';
import { Application } from 'proto/application_pb';
import ApplicationDetails from 'components/applications/ApplicationDetails';
import ApplicationGallery from 'components/applications/ApplicationGallery';
import ApplicationsToolbar from 'components/applications/ApplicationsToolbar';
import { apiURL } from 'utils/constants';
import { applicationsDescription } from 'utils/constants';

// clustersService is the Clusters gRPC service, which is used to get a list of resources.
const clustersService = new ClustersPromiseClient(apiURL, null, null);

export interface IScope {
  clusters: string[];
  namespaces: string[];
}

// Applications is the page to display a list of selected applications. To get the applications the user can select a
// scope (list of clusters and namespaces).
const Applications: React.FunctionComponent = () => {
  const [scope, setScope] = useState<IScope | undefined>(undefined);
  const [applications, setApplications] = useState<Application.AsObject[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application.AsObject | undefined>(undefined);
  const [error, setError] = useState<string>('');

  // fetchApplications is used to fetch a list of applications. To get the list of applications the user has to select
  // a list of clusters and namespaces.
  const fetchApplications = useCallback(async () => {
    if (scope && scope.clusters.length > 0 && scope.namespaces.length > 0) {
      try {
        const getApplicationsRequest = new GetApplicationsRequest();
        getApplicationsRequest.setClustersList(scope.clusters);
        getApplicationsRequest.setNamespacesList(scope.namespaces);

        const getApplicationsResponse: GetApplicationsResponse = await clustersService.getApplications(
          getApplicationsRequest,
          null,
        );

        setApplications(getApplicationsResponse.toObject().applicationsList);
        setError('');
      } catch (err) {
        setError(err.message);
      }
    }
  }, [scope]);

  // useEffect is used to call the fetchApplications function every time the list of clusters and namespaces (scope),
  // changes.
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          Applications
        </Title>
        <p>{applicationsDescription}</p>
        <ApplicationsToolbar setScope={setScope} />
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
              {!scope ? (
                <Alert variant={AlertVariant.info} title="Select clusters and namespaces">
                  <p>Select a list of clusters and namespaces from the toolbar.</p>
                </Alert>
              ) : scope.clusters.length === 0 || scope.namespaces.length === 0 ? (
                <Alert variant={AlertVariant.danger} title="Select clusters and namespaces">
                  <p>
                    You have to select a minimum of one cluster and namespace from the toolbar to search for
                    applications.
                  </p>
                </Alert>
              ) : error ? (
                <Alert variant={AlertVariant.danger} title="Applications were not fetched">
                  <p>{error}</p>
                </Alert>
              ) : (
                <ApplicationGallery applications={applications} selectApplication={setSelectedApplication} />
              )}
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default Applications;
