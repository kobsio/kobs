import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Grid,
  GridItem,
  List,
  ListItem,
  ListVariant,
  PageSection,
  PageSectionVariants,
  Spinner,
} from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { ClustersPromiseClient, GetTeamRequest, GetTeamResponse } from 'proto/clusters_grpc_web_pb';
import { Application } from 'proto/application_pb';
import ExternalLink from 'components/ExternalLink';
import { Team as ITeam } from 'proto/team_pb';
import TeamApplications from 'components/teams/TeamApplications';
import Title from 'components/Title';
import { apiURL } from 'utils/constants';

// clustersService is the Clusters gRPC service, which is used to get a list of teams.
const clustersService = new ClustersPromiseClient(apiURL, null, null);

interface IDataState {
  applications: Application.AsObject[];
  error: string;
  isLoading: boolean;
  team?: ITeam.AsObject;
}

interface ITeamParams {
  name: string;
}

// Team is the component for the teams page. It loads the complete Team CR and the list of applications for this team.
const Team: React.FunctionComponent = () => {
  const history = useHistory();
  const params = useParams<ITeamParams>();
  const [data, setData] = useState<IDataState>({ applications: [], error: '', isLoading: false, team: undefined });

  // fetchTeam fetches the Team CR and a list of Applications, which can be associated with the team.
  const fetchTeam = useCallback(async () => {
    try {
      setData({ applications: [], error: '', isLoading: true, team: undefined });

      const getTeamRequest = new GetTeamRequest();
      getTeamRequest.setName(params.name);

      const getTeamResponse: GetTeamResponse = await clustersService.getTeam(getTeamRequest, null);
      const tmpTeam = getTeamResponse.toObject();

      setData({ applications: tmpTeam.applicationsList, error: '', isLoading: false, team: tmpTeam.team });
    } catch (err) {
      setData({ applications: [], error: err.message, isLoading: false, team: undefined });
    }
  }, [params.name]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  if (data.isLoading) {
    return <Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />;
  }

  if (data.error || !data.team) {
    return (
      <Alert
        style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }}
        variant={AlertVariant.danger}
        title="Could not get team"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
            <AlertActionLink onClick={(): void => history.push('/teams')}>Teams</AlertActionLink>
            <AlertActionLink onClick={fetchTeam}>Retry</AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{data.error ? data.error : 'Team is undefined'}</p>
      </Alert>
    );
  }

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title title={data.team.name} subtitle="" size="xl" />
        <div>
          <p>{data.team.description}</p>
          <List variant={ListVariant.inline}>
            {data.team.linksList.map((link, index) => (
              <ListItem key={index}>
                <ExternalLink title={link.title} link={link.link} />
              </ListItem>
            ))}
          </List>
        </div>
      </PageSection>

      <PageSection variant={PageSectionVariants.default}>
        <Grid hasGutter={true}>
          <GridItem sm={12} md={12} lg={12} xl={12} xl2={12}>
            <TeamApplications applications={data.applications} />
          </GridItem>
        </Grid>
      </PageSection>
    </React.Fragment>
  );
};

export default Team;
