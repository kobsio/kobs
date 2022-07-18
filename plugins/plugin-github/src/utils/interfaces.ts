import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';
import { Octokit } from '@octokit/rest';

export interface IPanelOptions {
  type?: string;
  team?: string;
  repository?: string;
}

const octokit = new Octokit();
export type TOrgMembers = GetResponseDataTypeFromEndpointMethod<typeof octokit.orgs.listMembers>;
export type TOrgTeams = GetResponseDataTypeFromEndpointMethod<typeof octokit.teams.list>;
export type TOrgPullRequests = GetResponseDataTypeFromEndpointMethod<typeof octokit.search.issuesAndPullRequests>;
export type TOrgRepos = GetResponseDataTypeFromEndpointMethod<typeof octokit.repos.listForOrg>;
export type TTeam = GetResponseDataTypeFromEndpointMethod<typeof octokit.teams.getByName>;
export type TTeamMembers = GetResponseDataTypeFromEndpointMethod<typeof octokit.teams.listMembersInOrg>;
export type TTeamRepos = GetResponseDataTypeFromEndpointMethod<typeof octokit.teams.listReposInOrg>;
export type TRepository = GetResponseDataTypeFromEndpointMethod<typeof octokit.repos.get>;
export type TRepositoryIssues = GetResponseDataTypeFromEndpointMethod<typeof octokit.issues.listForRepo>;
export type TRepositoryPullRequests = GetResponseDataTypeFromEndpointMethod<typeof octokit.pulls.list>;
export type TRepositoryWorkflowRuns = GetResponseDataTypeFromEndpointMethod<
  typeof octokit.actions.listWorkflowRunsForRepo
>;
export type TRepositoryWorkflowRunsJobs = GetResponseDataTypeFromEndpointMethod<
  typeof octokit.actions.listJobsForWorkflowRunAttempt
>;
export type TUserPullRequests = GetResponseDataTypeFromEndpointMethod<typeof octokit.search.issuesAndPullRequests>;
