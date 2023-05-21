import {
  APIContext,
  APIError,
  IAPIContext,
  IPluginInstance,
  Pagination,
  pluginBasePath,
  UseQueryWrapper,
} from '@kobsio/core';
import { Box, Card, Chip, Divider, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Fragment, FunctionComponent, useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import { IProject, IProjectsData } from '../utils/utils';

const Project: FunctionComponent<{ instance: IPluginInstance; project: IProject }> = ({ instance, project }) => {
  return (
    <ListItem
      component={Link}
      to={`${pluginBasePath(instance)}/${encodeURIComponent(project.name)}`}
      sx={{ color: 'inherit', textDecoration: 'inherit' }}
    >
      <ListItemText
        primary={<Typography variant="h6">{project.name}</Typography>}
        secondaryTypographyProps={{ component: 'div' }}
        secondary={
          <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 4, pt: 2 }}>
            <Chip color="default" size="small" sx={{ cursor: 'pointer' }} label={`Repos: ${project.repo_count || 0}`} />
            <Chip
              color="default"
              size="small"
              sx={{ cursor: 'pointer' }}
              label={`Charts: ${project.chart_count || 0}`}
            />
            <Chip
              color="default"
              size="small"
              sx={{ cursor: 'pointer' }}
              label={`Access Level: ${project.metadata.public === 'true' ? 'public' : 'private'}`}
            />
            <Chip
              color="default"
              size="small"
              sx={{ cursor: 'pointer' }}
              label={`Auto Scan: ${project.metadata.auto_scan ? 'enabled' : 'disabled'}`}
            />
            <Chip
              color="default"
              size="small"
              sx={{ cursor: 'pointer' }}
              label={`Severity: ${project.metadata.severity || '-'}`}
            />
          </Box>
        }
      />
    </ListItem>
  );
};

const Projects: FunctionComponent<{ instance: IPluginInstance }> = ({ instance }) => {
  const apiContext = useContext<IAPIContext>(APIContext);
  const [page, setPage] = useState<{ page: number; perPage: number }>({ page: 1, perPage: 10 });

  const { isError, isLoading, error, data, refetch } = useQuery<IProjectsData, APIError>(
    ['harbor/projects', instance, page],
    async () => {
      return apiContext.client.get<IProjectsData>(
        `/api/plugins/harbor/projects?page=${page?.page}&pageSize=${page?.perPage}`,
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
      errorTitle="Failed to load projects"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.projects.length === 0}
      noDataTitle="No projects were found"
      refetch={refetch}
    >
      <Card>
        <List disablePadding={true}>
          {data?.projects?.map((project, index) => (
            <Fragment key={project.project_id}>
              <Project instance={instance} project={project} />
              {index + 1 !== data?.projects?.length && <Divider component="li" />}
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

export default Projects;
