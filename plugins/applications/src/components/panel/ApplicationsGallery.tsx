import { Alert, AlertActionLink, AlertVariant, Gallery, GalleryItem, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { memo } from 'react';
import { useHistory } from 'react-router-dom';

import { IApplication, IReference } from '../../utils/utils';
import ApplicationsGalleryItem from './ApplicationsGalleryItem';

interface IApplicationsGalleryProps {
  clusters: string[];
  namespaces: string[];
  team?: IReference;
  showDetails?: (details: React.ReactNode) => void;
}

// ApplicationsGallery is the component to display all applications inside a gallery view.
const ApplicationsGallery: React.FunctionComponent<IApplicationsGalleryProps> = ({
  clusters,
  namespaces,
  team,
  showDetails,
}: IApplicationsGalleryProps) => {
  const history = useHistory();

  const { isError, isLoading, error, data, refetch } = useQuery<IApplication[], Error>(
    ['applications/applications', 'gallery', clusters, namespaces, team],
    async () => {
      try {
        const clusterParams = clusters.map((cluster) => `cluster=${cluster}`).join('&');
        const namespaceParams = namespaces.map((namespace) => `namespace=${namespace}`).join('&');

        const response = await fetch(
          `/api/plugins/applications/applications?view=gallery&teamCluster=${team?.cluster}&teamNamespace=${team?.namespace}&teamName=${team?.name}&${clusterParams}&${namespaceParams}`,
          {
            method: 'get',
          },
        );
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          return json;
        } else {
          if (json.error) {
            throw new Error(json.error);
          } else {
            throw new Error('An unknown error occured');
          }
        }
      } catch (err) {
        throw err;
      }
    },
  );

  if (isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        variant={AlertVariant.danger}
        title="Applications were not fetched"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IApplication[], Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Gallery hasGutter={true}>
      {data.map((application, index) => (
        <GalleryItem key={index}>
          <ApplicationsGalleryItem application={application} showDetails={showDetails} />
        </GalleryItem>
      ))}
    </Gallery>
  );
};

export default memo(ApplicationsGallery, (prevProps, nextProps) => {
  if (
    JSON.stringify(prevProps.clusters) === JSON.stringify(nextProps.clusters) &&
    JSON.stringify(prevProps.namespaces) === JSON.stringify(nextProps.namespaces) &&
    prevProps.team === nextProps.team
  ) {
    return true;
  }

  return false;
});
