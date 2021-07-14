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
import { DashboardsWrapper } from '@kobsio/plugin-dashboards';
import { ITeam } from '../../utils/interfaces';

interface ITeamParams {
  cluster: string;
  namespace: string;
  name: string;
}

// Team is the component for the teams page.n It loads a team by the specified cluster, namespace and name URL
// parameter. Everytime the cluster, namespace or name parameter is changed we make an API call to get the team.
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

  // During the API call we are showing a spinner, to show the user that the team is currently loading.
  if (isLoading) {
    return <Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />;
  }

  // When an error occures during the API call, we show the user this error. The user can then go back to the home page,
  // to the teams page or he can retry the API call.
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

  // When the data is undefined and the isLoading and isError variables are not true we show nothing. This happens while
  // the component is rendered the first time.
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

      {data.dashboards ? (
        <DashboardsWrapper defaults={data} references={data.dashboards} useDrawer={true} />
      ) : (
        <PageSection variant={PageSectionVariants.default}></PageSection>
      )}
    </React.Fragment>
  );
};

export default Team;
