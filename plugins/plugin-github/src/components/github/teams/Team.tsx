import {
  Alert,
  AlertActionLink,
  AlertVariant,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React, { useContext } from 'react';

import { AuthContext, IAuthContext } from '../../../context/AuthContext';
import { IPluginInstance, PluginPanel } from '@kobsio/shared';
import { TTeam } from '../../../utils/interfaces';

interface ITeamProps {
  title: string;
  description?: string;
  slug: string;
  instance: IPluginInstance;
}

const Team: React.FunctionComponent<ITeamProps> = ({ title, description, slug, instance }: ITeamProps) => {
  const authContext = useContext<IAuthContext>(AuthContext);

  const { isError, isLoading, error, data, refetch } = useQuery<TTeam, Error>(
    ['github/team', authContext.organization, slug, instance],
    async () => {
      try {
        const octokit = authContext.getOctokitClient();
        const team = await octokit.teams.getByName({
          org: authContext.organization,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          team_slug: slug,
        });
        return team.data;
      } catch (err) {
        throw err;
      }
    },
  );

  return (
    <PluginPanel title={title} description={description}>
      {isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Alert
          variant={AlertVariant.danger}
          isInline={true}
          title="Could not get team"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<TTeam, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data ? (
        <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
          <DescriptionListGroup>
            <DescriptionListTerm>Name</DescriptionListTerm>
            <DescriptionListDescription>{data.name}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Description</DescriptionListTerm>
            <DescriptionListDescription>{data.description || '-'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Members</DescriptionListTerm>
            <DescriptionListDescription>{data.members_count || 0}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Repositories</DescriptionListTerm>
            <DescriptionListDescription>{data.repos_count || 0}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      ) : (
        <div></div>
      )}
    </PluginPanel>
  );
};

export default Team;
