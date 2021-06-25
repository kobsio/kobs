import {
  Alert,
  AlertActionLink,
  AlertVariant,
  List,
  ListItem,
  ListVariant,
  PageSection,
  PageSectionVariants,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';
import React from 'react';

import { ExternalLink, Title } from '@kobsio/plugin-core';
import { ITeam } from '../../utils/utils';

interface ITeamParams {
  cluster: string;
  namespace: string;
  name: string;
}

// Team is the component for the teams page.n It loads a team by the specified cluster, namespace and name URL
// parameter.
const Team: React.FunctionComponent = () => {
  const history = useHistory();
  const params = useParams<ITeamParams>();

  const { isError, isLoading, error, data, refetch } = useQuery<ITeam, Error>(
    ['teams/team', params.cluster, params.namespace, params.name],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/teams/team?cluster=${params.cluster}&namespace=${params.namespace}&name=${params.name}`,
          { method: 'get' },
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
    return <Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />;
  }

  if (isError) {
    return (
      <Alert
        style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }}
        variant={AlertVariant.danger}
        title="Could not get team"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
            <AlertActionLink onClick={(): void => history.push('/teams')}>Teams</AlertActionLink>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<ITeam, Error>> => refetch()}>
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
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title title={data.name} subtitle={`${data.namespace} (${data.cluster})`} size="xl" />
        <div>
          <p>{data.description}</p>
          {data.links && data.links.length > 0 ? (
            <List variant={ListVariant.inline}>
              {data.links.map((link, index) => (
                <ListItem key={index}>
                  <ExternalLink title={link.title} link={link.link} />
                </ListItem>
              ))}
            </List>
          ) : null}
        </div>
      </PageSection>
      <PageSection variant={PageSectionVariants.default}>TODO</PageSection>
    </React.Fragment>
  );
};

export default Team;
