import { IPluginPanelProps, PluginPanelError } from '@kobsio/core';
import { FunctionComponent } from 'react';

import { OrgPullRequests } from './org/OrgPullRequests';
import { OrgRepos } from './org/OrgRepos';
import { RepositoryIssues } from './repos/RepositoryIssues';
import { RepositoryPullRequests } from './repos/RepositoryPullRequests';
import { RepositoryWorkflowRuns } from './repos/RepositoryWorkflowRuns';
import { TeamMembers } from './teams/TeamMembers';
import { TeamRepos } from './teams/TeamRepos';
import { UserPullRequests } from './users/UserPullRequests';

import { AuthContextProvider } from '../context/AuthContext';

interface IOptions {
  repository?: string;
  team?: string;
  type?: string;
}

const GithubPanel: FunctionComponent<IPluginPanelProps<IOptions>> = ({ title, description, options, instance }) => {
  if (options && options.type && options.type === 'orgpullrequests') {
    return (
      <AuthContextProvider title={title} instance={instance}>
        <OrgPullRequests title={title} description={description} instance={instance} />
      </AuthContextProvider>
    );
  }

  if (options && options.type && options.type === 'orgrepositories') {
    return (
      <AuthContextProvider title={title} instance={instance}>
        <OrgRepos title={title} description={description} instance={instance} />
      </AuthContextProvider>
    );
  }

  if (options && options.type && options.type === 'teammembers' && options.team) {
    return (
      <AuthContextProvider title={title} instance={instance}>
        <TeamMembers title={title} description={description} slug={options.team} instance={instance} />
      </AuthContextProvider>
    );
  }

  if (options && options.type && options.type === 'teamrepositories' && options.team) {
    return (
      <AuthContextProvider title={title} instance={instance}>
        <TeamRepos title={title} description={description} slug={options.team} instance={instance} />
      </AuthContextProvider>
    );
  }

  if (options && options.type && options.type === 'repositoryissues' && options.repository) {
    return (
      <AuthContextProvider title={title} instance={instance}>
        <RepositoryIssues title={title} description={description} repo={options.repository} instance={instance} />
      </AuthContextProvider>
    );
  }

  if (options && options.type && options.type === 'repositorypullrequests' && options.repository) {
    return (
      <AuthContextProvider title={title} instance={instance}>
        <RepositoryPullRequests title={title} description={description} repo={options.repository} instance={instance} />
      </AuthContextProvider>
    );
  }

  if (options && options.type && options.type === 'repositoryworkflowruns' && options.repository) {
    return (
      <AuthContextProvider title={title} instance={instance}>
        <RepositoryWorkflowRuns title={title} description={description} repo={options.repository} instance={instance} />
      </AuthContextProvider>
    );
  }

  if (options && options.type && options.type === 'userpullrequests') {
    return (
      <AuthContextProvider title={title} instance={instance}>
        <UserPullRequests title={title} description={description} instance={instance} />
      </AuthContextProvider>
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Invalid options for GitHub plugin"
      details="One of the required options is missing."
      example={`plugin:
  name: github
  type: github
  options:
    type: repositorypullrequests
    repository: kobs`}
      documentation="https://kobs.io/main/plugins/github"
    />
  );
};

export default GithubPanel;
