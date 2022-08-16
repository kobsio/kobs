import { Alert, AlertActionLink, AlertVariant, Flex, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React, { useContext, useState } from 'react';

import { AuthContext, IAuthContext } from '../../../context/AuthContext';
import GitHubPagination, { IPage } from '../GitHubPagination';
import { IPluginInstance, PluginPanel } from '@kobsio/shared';
import Member from '../Member';
import { TTeamMembers } from '../../../utils/interfaces';

interface ITeamMembersProps {
  title: string;
  description?: string;
  slug: string;
  instance: IPluginInstance;
}

const TeamMembers: React.FunctionComponent<ITeamMembersProps> = ({
  title,
  description,
  slug,
  instance,
}: ITeamMembersProps) => {
  const authContext = useContext<IAuthContext>(AuthContext);
  const [page, setPage] = useState<IPage>({ page: 1, perPage: 20 });

  const { isError, isLoading, error, data, refetch } = useQuery<TTeamMembers, Error>(
    ['github/team/members', authContext.organization, slug, instance],
    async () => {
      try {
        const octokit = authContext.getOctokitClient();
        const members = await octokit.paginate(octokit.teams.listMembersInOrg, {
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
          title="Could not get team members"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<TTeamMembers, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data ? (
        <Flex>
          {data.slice((page.page - 1) * page.perPage, page.page * page.perPage).map((member) => (
            <Member key={member.login} login={member.login} url={member.html_url} avatar={member.avatar_url} />
          ))}
        </Flex>
      ) : (
        <div></div>
      )}
    </PluginPanel>
  );
};

export default TeamMembers;
