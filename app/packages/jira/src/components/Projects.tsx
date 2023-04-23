import {
  APIContext,
  APIError,
  IAPIContext,
  IPluginInstance,
  ITimes,
  Pagination,
  PluginPanel,
  UseQueryWrapper,
  pluginBasePath,
} from '@kobsio/core';
import { Clear, Search } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Typography,
  darken,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FormEvent, Fragment, FunctionComponent, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface IProject {
  avatarUrls: {
    '16x16'?: string;
    '24x24'?: string;
    '32x32'?: string;
    '48x48'?: string;
  };
  expand: string;
  id: string;
  issueTypes?: {
    avatarId?: number;
    description?: string;
    iconUrl?: string;
    id?: string;
    name?: string;
    self?: string;
    subtask?: boolean;
  }[];
  key: string;
  name: string;
  projectCategory?: {
    description: string;
    id: string;
    name: string;
    self: string;
  };
  projectTypeKey: string;
  self: string;
}

const Project: FunctionComponent<{ instance: IPluginInstance; project: IProject }> = ({ instance, project }) => {
  return (
    <ListItem
      component={Link}
      to={`${pluginBasePath(instance)}/search?jql=${encodeURIComponent(`project = ${project.key}`)}`}
      sx={{ color: 'inherit', textDecoration: 'inherit' }}
    >
      <ListItemAvatar>
        <Avatar
          sx={(theme) => ({ bgcolor: darken(theme.palette.background.paper, 0.13), color: 'text.primary' })}
          alt={project.key}
          src={project.avatarUrls['48x48']}
        />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography variant="h6">
            {project.name} ({project.key})
          </Typography>
        }
      />
    </ListItem>
  );
};

const ProjectsToolbar: FunctionComponent<{ filter: string; setFilter: (filter: string) => void }> = ({
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

export const Projects: FunctionComponent<{
  description?: string;
  instance: IPluginInstance;
  times: ITimes;
  title: string;
}> = ({ instance, title, description, times }) => {
  const apiContext = useContext<IAPIContext>(APIContext);
  const [options, setOptions] = useState<{ filter: string; page: number; perPage: number }>({
    filter: '',
    page: 1,
    perPage: 10,
  });

  const { isError, isLoading, error, data, refetch } = useQuery<IProject[], APIError>(
    ['jira/projects', instance, times],
    async () => {
      return apiContext.client.get<IProject[]>('/api/plugins/jira/projects', {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
    },
  );

  return (
    <PluginPanel title={title} description={description}>
      <UseQueryWrapper
        error={error}
        errorTitle="Failed to get projects"
        isError={isError}
        isLoading={isLoading}
        isNoData={!data || data.length === 0}
        noDataTitle="No projects were found"
        refetch={refetch}
      >
        <ProjectsToolbar
          filter={options.filter}
          setFilter={(filter) => setOptions({ ...options, filter: filter, page: 1 })}
        />

        <List disablePadding={true}>
          {data
            ?.filter(
              (project) =>
                project.name.toLowerCase().includes(options.filter.toLowerCase()) ||
                project.key?.toLowerCase().includes(options.filter.toLowerCase()),
            )
            .slice((options.page - 1) * options.perPage, options.page * options.perPage)
            .map((project, index) => (
              <Fragment key={project.id}>
                <Project instance={instance} project={project} />
                {index + 1 !== data?.length && <Divider component="li" />}
              </Fragment>
            ))}
        </List>

        <Pagination
          count={data?.length ?? 0}
          page={options.page ?? 1}
          perPage={options.perPage ?? 10}
          handleChange={(page, perPage) => setOptions({ ...options, page: page, perPage: perPage })}
        />
      </UseQueryWrapper>
    </PluginPanel>
  );
};
