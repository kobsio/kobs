import {
  Alert,
  AlertActionLink,
  AlertVariant,
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Flex,
  FlexItem,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React, { useContext, useState } from 'react';

import { AuthContext, IAuthContext } from '../../../context/AuthContext';
import GitHubPagination, { IPage } from '../GitHubPagination';
import { IPluginInstance, PluginPanel } from '@kobsio/shared';
import { TOrgTeams } from '../../../utils/interfaces';
import TeamDetails from '../teams/TeamDetails';

interface IOrgTeamsProps {
  title: string;
  description?: string;
  instance: IPluginInstance;
  setDetails?: (details: React.ReactNode) => void;
}

const OrgTeams: React.FunctionComponent<IOrgTeamsProps> = ({
  title,
  description,
  instance,
  setDetails,
}: IOrgTeamsProps) => {
  const authContext = useContext<IAuthContext>(AuthContext);
  const [page, setPage] = useState<IPage>({ page: 1, perPage: 10 });

  const { isError, isLoading, error, data, refetch } = useQuery<TOrgTeams, Error>(
    ['github/org/teams', authContext.organization, instance],
    async () => {
      try {
        const octokit = authContext.getOctokitClient();
        const teams = await octokit.paginate(octokit.teams.list, {
          org: authContext.organization,
          page: 1,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          per_page: 100,
        });
        return teams;
      } catch (err) {
        throw err;
      }
    },
  );

  const selectTeam = (id: string): void => {
    if (setDetails) {
      const team = data?.filter((team) => team.slug === id);
      if (team && team.length === 1) {
        setDetails(
          <TeamDetails
            slug={id}
            name={team[0].name}
            url={team[0].html_url}
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
          title="Could not get organization teams"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<TOrgTeams, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data ? (
        <DataList aria-label="teams" isCompact={true} onSelectDataListItem={setDetails ? selectTeam : undefined}>
          {data.slice((page.page - 1) * page.perPage, page.page * page.perPage).map((team) => (
            <DataListItem key={team.id} id={team.slug} aria-labelledby={team.name}>
              <DataListItemRow>
                <DataListItemCells
                  dataListCells={[
                    <DataListCell key="main">
                      <Flex direction={{ default: 'column' }}>
                        <FlexItem>
                          <p>{team.name}</p>
                          <small>{team.description}</small>
                        </FlexItem>
                      </Flex>
                    </DataListCell>,
                  ]}
                />
              </DataListItemRow>
            </DataListItem>
          ))}
        </DataList>
      ) : (
        <div></div>
      )}
    </PluginPanel>
  );
};

export default OrgTeams;
