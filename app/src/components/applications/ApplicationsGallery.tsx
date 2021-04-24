import { Alert, AlertVariant, Gallery, GalleryItem, Spinner } from '@patternfly/react-core';
import React, { memo, useCallback, useEffect, useState } from 'react';

import { ClustersPromiseClient, GetApplicationsRequest, GetApplicationsResponse } from 'proto/clusters_grpc_web_pb';
import { Application } from 'proto/application_pb';
import ApplicationsItem from 'components/applications/ApplicationsItem';
import { apiURL } from 'utils/constants';

// clustersService is the Clusters gRPC service, which is used to get a list of resources.
const clustersService = new ClustersPromiseClient(apiURL, null, null);

interface IDataState {
  applications: Application.AsObject[];
  error: string;
  isLoading: boolean;
}

interface IApplicationsGalleryProps {
  clusters: string[];
  namespaces: string[];
  selectApplication: (application: Application.AsObject) => void;
}

// ApplicationsGallery is the component to display all applications inside a gallery view.
const ApplicationsGallery: React.FunctionComponent<IApplicationsGalleryProps> = ({
  clusters,
  namespaces,
  selectApplication,
}: IApplicationsGalleryProps) => {
  const [data, setData] = useState<IDataState>({
    applications: [],
    error: '',
    isLoading: false,
  });

  // fetchApplications is used to fetch a list of applications. To get the list of applications the user has to select
  // a list of clusters and namespaces.
  const fetchApplications = useCallback(async () => {
    try {
      if (clusters.length > 0 && namespaces.length > 0) {
        setData({ applications: [], error: '', isLoading: true });

        const getApplicationsRequest = new GetApplicationsRequest();
        getApplicationsRequest.setClustersList(clusters);
        getApplicationsRequest.setNamespacesList(namespaces);

        const getApplicationsResponse: GetApplicationsResponse = await clustersService.getApplications(
          getApplicationsRequest,
          null,
        );

        setData({ applications: getApplicationsResponse.toObject().applicationsList, error: '', isLoading: false });
      }
    } catch (err) {
      setData({ applications: [], error: err.message, isLoading: false });
    }
  }, [clusters, namespaces]);

  // Trigger the useEffect everytime the list of clusters or namespaces is changed.
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  if (data.isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  if (data.error) {
    return (
      <Alert variant={AlertVariant.danger} title="Applications were not fetched">
        <p>{data.error}</p>
      </Alert>
    );
  }

  return (
    <Gallery hasGutter={true}>
      {data.applications.map((application, index) => (
        <GalleryItem key={index}>
          <ApplicationsItem application={application} selectApplication={selectApplication} />
        </GalleryItem>
      ))}
    </Gallery>
  );
};

export default memo(ApplicationsGallery, (prevProps, nextProps) => {
  if (
    JSON.stringify(prevProps.clusters) === JSON.stringify(nextProps.clusters) &&
    JSON.stringify(prevProps.namespaces) === JSON.stringify(nextProps.namespaces)
  ) {
    return true;
  }

  return false;
});
