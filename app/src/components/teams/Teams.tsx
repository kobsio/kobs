import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Gallery,
  GalleryItem,
  PageSection,
  PageSectionVariants,
  Spinner,
  Title,
} from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { ClustersPromiseClient, GetTeamsRequest, GetTeamsResponse } from 'proto/clusters_grpc_web_pb';
import { Team } from 'proto/team_pb';
import TeamsItem from 'components/teams/TeamsItem';
import { apiURL } from 'utils/constants';
import { teamsDescription } from 'utils/constants';

// clustersService is the Clusters gRPC service, which is used to get a list of teams.
const clustersService = new ClustersPromiseClient(apiURL, null, null);

interface IDataState {
  error: string;
  isLoading: boolean;
  teams: Team.AsObject[];
}

// The Teams component is used to show a list of teams, with their name, description and logo. When the user clicks on
// the card of a team, he is redirected to the page for this team.
const Teams: React.FunctionComponent = () => {
  const history = useHistory();
  const [data, setData] = useState<IDataState>({ error: '', isLoading: false, teams: [] });

  // fetchTeams fetchs all teams from the gRPC API. Each team just contains the name, description and logo for this
  // team. If we need more data in this component we have to add them in the corresponding implementation of the
  // GetTeams function in the gRPC server.
  const fetchTeams = useCallback(async () => {
    try {
      setData({ error: '', isLoading: true, teams: [] });

      const getTeamsRequest = new GetTeamsRequest();
      const getTeamsResponse: GetTeamsResponse = await clustersService.getTeams(getTeamsRequest, null);

      const tmpTeams = getTeamsResponse.toObject();

      setData({ error: '', isLoading: false, teams: tmpTeams.teamsList });
    } catch (err) {
      setData({ error: err.message, isLoading: false, teams: [] });
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          Teams
        </Title>
        <p>{teamsDescription}</p>
      </PageSection>

      <PageSection style={{ height: '100%', minHeight: '100%' }} variant={PageSectionVariants.default}>
        {data.isLoading ? (
          <div className="pf-u-text-align-center">
            <Spinner />
          </div>
        ) : data.error ? (
          <Alert
            variant={AlertVariant.danger}
            title="Could not get teams"
            actionLinks={
              <React.Fragment>
                <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
                <AlertActionLink onClick={fetchTeams}>Retry</AlertActionLink>
              </React.Fragment>
            }
          >
            <p>{data.error}</p>
          </Alert>
        ) : (
          <Gallery hasGutter={true}>
            {data.teams.map((team, index) => (
              <GalleryItem key={index}>
                <TeamsItem description={team.description} logo={team.logo} name={team.name} />
              </GalleryItem>
            ))}
          </Gallery>
        )}
      </PageSection>
    </React.Fragment>
  );
};

export default Teams;
