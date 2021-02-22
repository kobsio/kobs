import {
  Alert,
  AlertVariant,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  Gallery,
  GalleryItem,
  PageSection,
  PageSectionVariants,
  Title,
} from '@patternfly/react-core';
import React, { useState } from 'react';

import { GetApplicationsRequest, GetApplicationsResponse } from 'generated/proto/clusters_pb';
import { apiURL, applicationsDescription } from 'utils/constants';
import { Application } from 'generated/proto/applications_pb';
import Card from 'components/applications/details/Card';
import { ClustersPromiseClient } from 'generated/proto/clusters_grpc_web_pb';
import DrawerPanel from 'components/applications/details/DrawerPanel';
import Filter from 'components/resources/shared/Filter';

const clustersService = new ClustersPromiseClient(apiURL, null, null);

// Applications displays a list of applications (defined via the Application CRD). The applications can be filtered by
// cluster and namespace.
// When a application is selected it is shown in a drawer with some additional details, like resources, metrics, logs
// and traces.
const Applications: React.FunctionComponent = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | undefined>(undefined);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // fetchApplications is the function to fetch all applications for a list of clusters and namespaces from the gRPC
  // API. The function is used via the onFilter property of the Filter component.
  const fetchApplications = async (clusters: string[], namespaces: string[]): Promise<void> => {
    try {
      if (clusters.length === 0 || namespaces.length === 0) {
        throw new Error('You must select a cluster and a namespace');
      } else {
        setIsLoading(true);

        const getApplicationsRequest = new GetApplicationsRequest();
        getApplicationsRequest.setClustersList(clusters);
        getApplicationsRequest.setNamespacesList(namespaces);

        const getApplicationsResponse: GetApplicationsResponse = await clustersService.getApplications(
          getApplicationsRequest,
          null,
        );

        const tmpApplications = getApplicationsResponse.getApplicationsList();

        if (tmpApplications.length > 0) {
          setError('');
          setApplications(tmpApplications);
        } else {
          setError('No applications were found, adjust the cluster and namespace filter.');
        }

        setIsLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          Applications
        </Title>
        <p>{applicationsDescription}</p>
        <Filter isLoading={isLoading} onFilter={fetchApplications} />
      </PageSection>

      <Drawer isExpanded={selectedApplication !== undefined}>
        <DrawerContent
          panelContent={
            selectedApplication ? (
              <DrawerPanel application={selectedApplication} close={(): void => setSelectedApplication(undefined)} />
            ) : undefined
          }
        >
          <DrawerContentBody>
            <PageSection className="kobs-drawer-pagesection" variant={PageSectionVariants.default}>
              {error ? (
                <Alert variant={AlertVariant.danger} isInline={false} title="Could not load applications">
                  <p>{error}</p>
                </Alert>
              ) : (
                <Gallery hasGutter={true}>
                  {applications.map((application, index) => (
                    <GalleryItem key={index}>
                      <Card application={application} select={setSelectedApplication} />
                    </GalleryItem>
                  ))}
                </Gallery>
              )}
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default Applications;
