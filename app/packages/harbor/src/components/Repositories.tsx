import {
  APIContext,
  APIError,
  IAPIContext,
  IPluginInstance,
  Pagination,
  pluginBasePath,
  UseQueryWrapper,
  formatTimeString,
} from '@kobsio/core';
import { Box, Card, Chip, Divider, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Fragment, FunctionComponent, useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import { IRepositoriesData, IRepository } from '../utils/utils';

const Repository: FunctionComponent<{ instance: IPluginInstance; projectName: string; repository: IRepository }> = ({
  instance,
  projectName,
  repository,
}) => {
  return (
    <ListItem
      component={Link}
      to={`${pluginBasePath(instance)}/${encodeURIComponent(projectName)}/${encodeURIComponent(
        repository.name.replace(`${projectName}/`, ''),
      )}`}
      sx={{ color: 'inherit', textDecoration: 'inherit' }}
    >
      <ListItemText
        primary={<Typography variant="h6">{repository.name}</Typography>}
        secondaryTypographyProps={{ component: 'div' }}
        secondary={
          <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 4, pt: 2 }}>
            <Chip
              color="default"
              size="small"
              sx={{ cursor: 'pointer' }}
              label={`Artifacts: ${repository.artifact_count || 0}`}
            />
            <Chip
              color="default"
              size="small"
              sx={{ cursor: 'pointer' }}
              label={`Pulls: ${repository.pull_count || 0}`}
            />
            <Chip
              color="default"
              size="small"
              sx={{ cursor: 'pointer' }}
              label={`Last Modified Time: ${formatTimeString(repository.update_time)}`}
            />
          </Box>
        }
      />
    </ListItem>
  );
};

const Repositories: FunctionComponent<{
  instance: IPluginInstance;
  projectName: string;
  query: string;
}> = ({ instance, projectName, query }) => {
  const apiContext = useContext<IAPIContext>(APIContext);
  const [page, setPage] = useState<{ page: number; perPage: number }>({ page: 1, perPage: 10 });

  const { isError, isLoading, error, data, refetch } = useQuery<IRepositoriesData, APIError>(
    ['harbor/repositories', instance, projectName, query, page],
    async () => {
      return apiContext.client.get<IRepositoriesData>(
        `/api/plugins/harbor/repositories?projectName=${projectName}&query=${query}&page=${page.page}&pageSize=${page.perPage}`,
        {
          headers: {
            'x-kobs-cluster': instance.cluster,
            'x-kobs-plugin': instance.name,
          },
        },
      );
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load repositories"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.repositories.length === 0}
      noDataTitle="No repositories were found"
      refetch={refetch}
    >
      <Card>
        <List disablePadding={true}>
          {data?.repositories?.map((repository, index) => (
            <Fragment key={repository.id}>
              <Repository instance={instance} projectName={projectName} repository={repository} />
              {index + 1 !== data?.repositories?.length && <Divider component="li" />}
            </Fragment>
          ))}
        </List>
      </Card>

      <Pagination
        count={data?.total ?? 0}
        page={page.page ?? 1}
        perPage={page.perPage ?? 10}
        handleChange={(page, perPage) => setPage({ page: page, perPage: perPage })}
      />
    </UseQueryWrapper>
  );
};

export default Repositories;
