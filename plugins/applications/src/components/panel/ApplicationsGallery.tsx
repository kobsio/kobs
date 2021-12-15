import { Alert, AlertActionLink, AlertVariant, Gallery, GalleryItem, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { memo } from 'react';
import { useHistory } from 'react-router-dom';

import { IApplication, IApplicationReference, IPluginTimes } from '@kobsio/plugin-core';
import ApplicationsGalleryItem from './ApplicationsGalleryItem';

interface IApplicationsGalleryProps {
  clusters: string[];
  namespaces: string[];
  team?: IApplicationReference;
  times: IPluginTimes;
}

// ApplicationsGallery is the component to display all applications inside a gallery view.
const ApplicationsGallery: React.FunctionComponent<IApplicationsGalleryProps> = ({
  clusters,
  namespaces,
  team,
  times,
}: IApplicationsGalleryProps) => {
  const history = useHistory();

  const { isError, isLoading, error, data, refetch } = useQuery<IApplication[], Error>(
    ['applications/applications', 'gallery', clusters, namespaces, team, times],
    async () => {
      try {
        const clusterParams = clusters.map((cluster) => `cluster=${cluster}`).join('&');
        const namespaceParams = namespaces.map((namespace) => `namespace=${namespace}`).join('&');
        const teamParams =
          team && team.cluster && team.namespace && team.name
            ? `&teamCluster=${team.cluster}&teamNamespace=${team.namespace}&teamName=${team.name}`
            : '';

        const response = await fetch(
          `/api/plugins/applications/applications?view=gallery&${
            teamParams ? teamParams : `${clusterParams}&${namespaceParams}`
          }`,
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
          <ApplicationsGalleryItem times={times} application={application} />
        </GalleryItem>
      ))}
    </Gallery>
  );
};

// export default ApplicationsGallery;
export default memo(ApplicationsGallery, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
