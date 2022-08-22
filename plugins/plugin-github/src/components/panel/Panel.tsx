import React from 'react';

import { IPluginPanelProps, PluginPanelError } from '@kobsio/shared';
import { AuthContextProvider } from '../../context/AuthContext';
import { IPanelOptions } from '../../utils/interfaces';
import OrgMembers from '../github/org/OrgMembers';
import OrgPullRequests from '../github/org/OrgPullRequests';
import OrgRepos from '../github/org/OrgRepos';
import OrgTeams from '../github/org/OrgTeams';
import Repository from '../github/repos/Repository';
import RepositoryIssues from '../github/repos/RepositoryIssues';
import RepositoryPullRequests from '../github/repos/RepositoryPullRequests';
import RepositoryWorkflowRuns from '../github/repos/RepositoryWorkflowRuns';
import Team from '../github/teams/Team';
import TeamMembers from '../github/teams/TeamMembers';
import TeamRepos from '../github/teams/TeamRepos';
import UserNotifications from '../github/users/UserNotifications';
import UserPullRequests from '../github/users/UserPullRequests';

interface IGitHubPluginPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

const Panel: React.FunctionComponent<IGitHubPluginPanelProps> = ({
  title,
  description,
  options,
  instance,
  times,
  setDetails,
}: IGitHubPluginPanelProps) => {
  if (options && options.type && options.type === 'orgmemebers') {
    return (
      <AuthContextProvider title={title} isNotification={false} instance={instance}>
        <OrgMembers title={title} description={description} instance={instance} />
      </AuthContextProvider>
    );
  }

  if (options && options.type && options.type === 'orgpullrequests') {
    return (
      <AuthContextProvider title={title} isNotification={false} instance={instance}>
        <OrgPullRequests title={title} description={description} instance={instance} />
      </AuthContextProvider>
    );
  }

  if (options && options.type && options.type === 'orgrepositories') {
    return (
      <AuthContextProvider title={title} isNotification={false} instance={instance}>
        <OrgRepos title={title} description={description} instance={instance} setDetails={setDetails} />
      </AuthContextProvider>
    );
  }

  if (options && options.type && options.type === 'orgteams') {
    return (
      <AuthContextProvider title={title} isNotification={false} instance={instance}>
        <OrgTeams title={title} description={description} instance={instance} setDetails={setDetails} />
      </AuthContextProvider>
    );
  }

  if (options && options.type && options.type === 'team' && options.team) {
    return (
      <AuthContextProvider title={title} isNotification={false} instance={instance}>
        <Team title={title} description={description} slug={options.team} instance={instance} />
      </AuthContextProvider>
    );
  }

  if (options && options.type && options.type === 'teammembers' && options.team) {
    return (
      <AuthContextProvider title={title} isNotification={false} instance={instance}>
        <TeamMembers title={title} description={description} slug={options.team} instance={instance} />
      </AuthContextProvider>
    );
  }

  if (options && options.type && options.type === 'teamrepositories' && options.team) {
    return (
      <AuthContextProvider title={title} isNotification={false} instance={instance}>
        <TeamRepos
          title={title}
          description={description}
          slug={options.team}
          instance={instance}
          setDetails={setDetails}
        />
      </AuthContextProvider>
    );
  }

  if (options && options.type && options.type === 'repository' && options.repository) {
    return (
      <AuthContextProvider title={title} isNotification={false} instance={instance}>
        <Repository title={title} description={description} repo={options.repository} instance={instance} />
      </AuthContextProvider>
    );
  }

  if (options && options.type && options.type === 'repositoryissues' && options.repository) {
    return (
      <AuthContextProvider title={title} isNotification={false} instance={instance}>
        <RepositoryIssues title={title} description={description} repo={options.repository} instance={instance} />
      </AuthContextProvider>
    );
  }

  if (options && options.type && options.type === 'repositorypullrequests' && options.repository) {
    return (
      <AuthContextProvider title={title} isNotification={false} instance={instance}>
        <RepositoryPullRequests title={title} description={description} repo={options.repository} instance={instance} />
      </AuthContextProvider>
    );
  }

  if (options && options.type && options.type === 'repositoryworkflowruns' && options.repository) {
    return (
      <AuthContextProvider title={title} isNotification={false} instance={instance}>
        <RepositoryWorkflowRuns
          title={title}
          description={description}
          repo={options.repository}
          instance={instance}
          setDetails={setDetails}
        />
      </AuthContextProvider>
    );
  }

  if (options && options.type && options.type === 'userpullrequests') {
    return (
      <AuthContextProvider title={title} isNotification={false} instance={instance}>
        <UserPullRequests title={title} description={description} instance={instance} />
      </AuthContextProvider>
    );
  }

  if (options && options.type && options.type === 'usernotifications') {
    return (
      <AuthContextProvider title={title} isNotification={false} instance={instance}>
        <UserNotifications title={title} description={description} instance={instance} />
      </AuthContextProvider>
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Options for GitHub panel are missing or invalid"
      details="The panel doesn't contain the required options to get data from GitHub."
      documentation="https://kobs.io/main/plugins/github"
    />
  );
};

export default Panel;
