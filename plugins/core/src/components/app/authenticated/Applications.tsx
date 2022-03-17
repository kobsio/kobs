import { Alert, AlertActionLink, AlertVariant, Gallery, GalleryItem, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';
import { useHistory } from 'react-router-dom';

import ApplicationsItem from './ApplicationsItem';
import { IApplication } from '../../../crds/application';
import { IPluginTimes } from '../../../context/PluginsContext';
import { IUserTeamReference } from '../../../crds/user';

export interface IApplicationProps {
  team: IUserTeamReference;
}

const Applications: React.FunctionComponent<IApplicationProps> = ({ team }: IApplicationProps) => {
  const times: IPluginTimes = {
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  };
  const history = useHistory();

  const { isError, isLoading, error, data, refetch } = useQuery<IApplication[], Error>(
    ['core/applications', 'gallery', team],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/applications/applications?view=gallery&&teamCluster=${team.cluster}&teamNamespace=${team.namespace}&teamName=${team.name}`,
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

  if (!data || data.length === 0) {
    return (
      <Alert
        variant={AlertVariant.info}
        title="Applications not found"
        actionLinks={
          <React.Fragment>
            <AlertActionLink
              onClick={(): void => history.push(`/teams/${team.cluster}/${team.namespace}/${team.name}`)}
            >
              Team
            </AlertActionLink>
            <AlertActionLink onClick={(): void => history.push('/applications')}>Applications</AlertActionLink>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IApplication[], Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>It looks like your team does not have any Applications.</p>
      </Alert>
    );
  }

  return (
    <Gallery hasGutter={true}>
      {data.map((application, index) => (
        <GalleryItem key={index}>
          <ApplicationsItem times={times} application={application} />
        </GalleryItem>
      ))}
    </Gallery>
  );
};

export default Applications;
