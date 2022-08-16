import { Alert, AlertActionLink, AlertVariant, DataList, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React, { useContext, useState } from 'react';

import { AuthContext, IAuthContext } from '../../../context/AuthContext';
import GitHubPagination, { IPage } from '../GitHubPagination';
import { IPluginInstance, PluginPanel } from '@kobsio/shared';
import Repository from '../Repository';
import RepositoryDetails from '../repos/RepositoryDetails';
import { TTeamRepos } from '../../../utils/interfaces';

interface ITeamReposProps {
  title: string;
  description?: string;
  slug: string;
  instance: IPluginInstance;
  setDetails?: (details: React.ReactNode) => void;
}

const TeamRepos: React.FunctionComponent<ITeamReposProps> = ({
  title,
  description,
  slug,
  instance,
  setDetails,
}: ITeamReposProps) => {
  const authContext = useContext<IAuthContext>(AuthContext);
  const [page, setPage] = useState<IPage>({ page: 1, perPage: 20 });

  const { isError, isLoading, error, data, refetch } = useQuery<TTeamRepos, Error>(
    ['github/team/repos', authContext.organization, slug, instance],
    async () => {
      try {
        const octokit = authContext.getOctokitClient();
        const members = await octokit.paginate(octokit.teams.listReposInOrg, {
          org: authContext.organization,
          page: 1,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          per_page: 100,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          team_slug: slug,
        });
        return members;
      } catch (err) {
        throw err;
      }
    },
  );

  const selectRepo = (id: string): void => {
    if (setDetails) {
      const repo = data?.filter((repo) => repo.name === id);
      if (repo && repo.length === 1) {
        setDetails(
          <RepositoryDetails
            repo={id}
            url={repo[0].html_url}
            instance={instance}
            close={(): void => setDetails(undefined)}
          />,
        );
      }
    }
  };

  return (
    <PluginPanel
      title={title}
      description={description}
      footer={<GitHubPagination itemCount={data?.length || 0} page={page} setPage={setPage} />}
    >
      {isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Alert
          variant={AlertVariant.danger}
          isInline={true}
          title="Could not get team repositories"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<TTeamRepos, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data ? (
        <DataList aria-label="repositories" isCompact={true} onSelectDataListItem={setDetails ? selectRepo : undefined}>
          {data.slice((page.page - 1) * page.perPage, page.page * page.perPage).map((repo) => (
            <Repository
              key={repo.id}
              name={repo.name}
              description={repo.description}
              language={repo.language}
              stargazersCount={repo.stargazers_count}
              forksCount={repo.forks_count}
              openIssuesCount={repo.open_issues_count}
              updatedAt={repo.updated_at}
            />
          ))}
        </DataList>
      ) : (
        <div></div>
      )}
    </PluginPanel>
  );
};

export default TeamRepos;
