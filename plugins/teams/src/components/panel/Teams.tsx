import { Alert, AlertActionLink, AlertVariant, Gallery, GalleryItem, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { ITeam } from '../../utils/utils';
import TeamsItem from '../page/TeamsItem';

const Teams: React.FunctionComponent = () => {
  const { isError, isLoading, error, data, refetch } = useQuery<ITeam[], Error>(['teams/teams'], async () => {
    try {
      const response = await fetch(`/api/plugins/teams/teams`, { method: 'get' });
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
  });

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
        title="Could not get teams"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<ITeam[], Error>> => refetch()}>
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
      {data.map((team, index) => (
        <GalleryItem key={index}>
          <TeamsItem
            cluster={team.cluster}
            namespace={team.namespace}
            name={team.name}
            description={team.description}
            logo={team.logo}
          />
        </GalleryItem>
      ))}
    </Gallery>
  );
};

export default Teams;
