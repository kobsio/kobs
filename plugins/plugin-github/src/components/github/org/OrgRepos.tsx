import {
  Alert,
  AlertActionLink,
  AlertVariant,
  CardActions,
  DataList,
  Spinner,
  TextInput,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useContext, useState } from 'react';

import { AuthContext, IAuthContext } from '../../../context/AuthContext';
import GitHubPagination, { IPage } from '../GitHubPagination';
import { IPluginInstance, PluginPanel, useDebounce } from '@kobsio/shared';
import Repository from '../Repository';
import RepositoryDetails from '../repos/RepositoryDetails';
import { TOrgRepos } from '../../../utils/interfaces';

interface IOrgReposProps {
  title: string;
  description?: string;
  instance: IPluginInstance;
  setDetails?: (details: React.ReactNode) => void;
}

const OrgRepos: React.FunctionComponent<IOrgReposProps> = ({
  title,
  description,
  instance,
  setDetails,
}: IOrgReposProps) => {
  const authContext = useContext<IAuthContext>(AuthContext);
  const [page, setPage] = useState<IPage>({ page: 1, perPage: 20 });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 500);

  const { isError, isLoading, error, data, refetch } = useQuery<TOrgRepos, Error>(
    ['github/org/repos', authContext.organization, instance],
    async () => {
      try {
        const octokit = authContext.getOctokitClient();
        const members = await octokit.paginate(octokit.repos.listForOrg, {
          org: authContext.organization,
          page: 1,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          per_page: 100,
          sort: 'updated',
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
      actions={
        <CardActions>
          <TextInput
            placeholder="Filter"
            aria-label="Filter"
            value={searchTerm}
            onChange={(value: string): void => setSearchTerm(value)}
          />
        </CardActions>
      }
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
          title="Could not get organization members"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<TOrgRepos, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data ? (
        <DataList aria-label="repositories" isCompact={true} onSelectDataListItem={setDetails ? selectRepo : undefined}>
          {data
            .filter(
              (repo) =>
                repo.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                repo.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
            )
            .slice((page.page - 1) * page.perPage, page.page * page.perPage)
            .map((repo) => (
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

export default OrgRepos;
