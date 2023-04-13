import { IPluginInstance, Pagination, PluginPanel, UseQueryWrapper } from '@kobsio/core';
import { Clear, Search } from '@mui/icons-material';
import { Box, Divider, IconButton, InputAdornment, List, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FormEvent, Fragment, FunctionComponent, useContext, useEffect, useState } from 'react';

import { AuthContext, IAuthContext } from '../../context/AuthContext';
import { TSearchRepos } from '../../utils/utils';
import { Repository } from '../shared/Repository';

const OrgReposToolbar: FunctionComponent<{ filter: string; setFilter: (filter: string) => void }> = ({
  filter,
  setFilter,
}) => {
  const [internalFilter, setInternalFilter] = useState<string>(filter ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFilter(internalFilter);
  };

  const handleClear = () => {
    setInternalFilter('');
    setFilter('');
  };

  useEffect(() => {
    setInternalFilter(filter ?? '');
  }, [filter]);

  return (
    <Box sx={{ mb: 6 }} component="form" onSubmit={handleSubmit}>
      <TextField
        size="small"
        variant="outlined"
        placeholder="Search"
        fullWidth={true}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear}>
                <Clear />
              </IconButton>
            </InputAdornment>
          ),
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        value={internalFilter}
        onChange={(e) => setInternalFilter(e.target.value)}
      />
    </Box>
  );
};

export const OrgRepos: FunctionComponent<{
  description?: string;
  instance: IPluginInstance;
  setDetails?: (details: React.ReactNode) => void;
  title: string;
}> = ({ title, description, instance, setDetails }) => {
  const authContext = useContext<IAuthContext>(AuthContext);
  const [options, setOptions] = useState<{ filter: string; page: number; perPage: number }>({
    filter: '',
    page: 1,
    perPage: 10,
  });

  const { isError, isLoading, error, data, refetch } = useQuery<{ count: number; repos: TSearchRepos }, Error>(
    ['github/org/repos', authContext.organization, instance, options],
    async () => {
      const octokit = authContext.getOctokitClient();
      const result = await octokit.search.repos({
        order: 'desc',
        page: options.page,
        per_page: options.perPage,
        q: `org:${authContext.organization} ${options.filter}`,
        sort: 'updated',
      });
      return { count: result.data.total_count, repos: result.data.items };
    },
  );

  return (
    <PluginPanel title={title} description={description}>
      <UseQueryWrapper
        error={error}
        errorTitle="Failed to get repositories"
        isError={isError}
        isLoading={isLoading}
        isNoData={!data || !data.repos || data.repos.length === 0}
        noDataTitle="No repositories were found"
        refetch={refetch}
      >
        <OrgReposToolbar
          filter={options.filter}
          setFilter={(filter) => setOptions({ ...options, filter: filter, page: 1 })}
        />

        <List disablePadding={true}>
          {data?.repos.map((repo, index) => (
            <Fragment key={repo.id}>
              <Repository
                instance={instance}
                name={repo.name}
                description={repo.description}
                language={repo.language}
                stargazersCount={repo.stargazers_count}
                forksCount={repo.forks_count}
                openIssuesCount={repo.open_issues_count}
                pushedAt={repo.pushed_at}
              />
              {index + 1 !== data?.repos.length && <Divider component="li" />}
            </Fragment>
          ))}
        </List>
        <Pagination
          count={data?.count ?? 0}
          page={options.page}
          perPage={options.perPage}
          handleChange={(page, perPage) => setOptions({ ...options, page: page, perPage: perPage })}
        />
      </UseQueryWrapper>
    </PluginPanel>
  );
};
