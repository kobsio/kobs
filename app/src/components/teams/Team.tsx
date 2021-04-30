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
import React, { createRef, useCallback, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { ClustersPromiseClient, GetTeamRequest, GetTeamResponse } from 'proto/clusters_grpc_web_pb';
import TeamTabsContent, { IMountedTabs } from 'components/teams/TeamTabsContent';
import { Application } from 'proto/application_pb';
import ExternalLink from 'components/ExternalLink';
import { Team as ITeam } from 'proto/team_pb';
import TeamTabs from 'components/teams/TeamTabs';
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

  const [activeTab, setActiveTab] = useState<string>('applications');
  const [mountedTabs, setMountedTabs] = useState<IMountedTabs>({});
  const refApplicationsContent = useRef<HTMLElement>(null);
  const [refPluginsContent, setRefPluginsContent] = useState<React.RefObject<HTMLElement>[] | undefined>(
    data.team ? data.team.pluginsList.map(() => createRef<HTMLElement>()) : undefined,
  );

  // changeActiveTab sets the active tab and adds the name of the selected tab to the mountedTabs object. This object is
  // used to only load data, when a component is mounted the first time.
  const changeActiveTab = (tab: string): void => {
    setActiveTab(tab);
    setMountedTabs({ ...mountedTabs, [tab]: true });
  };

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

  // Since the team isn't defined on the first rendering of this component, we have to create the references for the
  // plugin tabs each time the team is updated.
  useEffect(() => {
    if (data.team) {
      setRefPluginsContent(data.team.pluginsList.map(() => createRef<HTMLElement>()));
    }
  }, [data.team]);

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

  console.log(data.team);

  return (
    <React.Fragment>
      <PageSection style={{ paddingBottom: '0px' }} variant={PageSectionVariants.light}>
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
        <TeamTabs
          activeTab={activeTab}
          setTab={changeActiveTab}
          plugins={data.team.pluginsList}
          refApplicationsContent={refApplicationsContent}
          refPluginsContent={refPluginsContent}
        />
      </PageSection>

      <TeamTabsContent
        applications={data.applications}
        team={data.team}
        activeTab={activeTab}
        mountedTabs={mountedTabs}
        refApplicationsContent={refApplicationsContent}
        refPluginsContent={refPluginsContent}
      />
    </React.Fragment>
  );
};

export default Team;
