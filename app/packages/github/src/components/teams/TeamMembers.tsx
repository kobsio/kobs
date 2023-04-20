import { IPluginInstance, ITimes, Pagination, PluginPanel, UseQueryWrapper } from '@kobsio/core';
import { Avatar, Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import { AuthContext, IAuthContext } from '../../context/AuthContext';
import { TTeamMembers } from '../../utils/utils';

export const TeamMembers: FunctionComponent<{
  description?: string;
  instance: IPluginInstance;
  slug: string;
  times: ITimes;
  title: string;
}> = ({ title, description, slug, instance, times }) => {
  const authContext = useContext<IAuthContext>(AuthContext);
  const [options, setOptions] = useState<{ page: number; perPage: number }>({ page: 1, perPage: 20 });

  const { isError, isLoading, error, data, refetch } = useQuery<TTeamMembers, Error>(
    ['github/team/members', authContext.organization, slug, instance, times],
    async () => {
      const octokit = authContext.getOctokitClient();
      const members = await octokit.paginate(octokit.teams.listMembersInOrg, {
        org: authContext.organization,
        page: 1,
        per_page: 100,
        team_slug: slug,
      });
      return members;
    },
  );

  return (
    <PluginPanel title={title} description={description}>
      <UseQueryWrapper
        error={error}
        errorTitle="Failed to get members"
        isError={isError}
        isLoading={isLoading}
        isNoData={!data || data.length === 0}
        noDataTitle="No members were found"
        refetch={refetch}
      >
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          {data?.slice((options.page - 1) * options.perPage, options.page * options.perPage).map((member) => (
            <Link key={member.login} to={member.html_url} target="_blank">
              <Avatar alt={member.login} src={member.avatar_url} />
            </Link>
          ))}
        </Box>
        <Pagination
          count={data?.length ?? 0}
          page={options.page}
          perPage={options.perPage}
          handleChange={(page, perPage) => setOptions({ page: page, perPage: perPage })}
        />
      </UseQueryWrapper>
    </PluginPanel>
  );
};
