import {
  APIContext,
  APIError,
  IAPIContext,
  IPluginInstance,
  IPluginPageProps,
  Page,
  Pagination,
  Toolbar,
  ToolbarItem,
  useQueryState,
  UseQueryWrapper,
} from '@kobsio/core';
import { Clear, ExpandMore, Search } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FormEvent, FunctionComponent, useContext, useEffect, useState } from 'react';

import Measures from './Measures';

import { description, IResponseProjects } from '../utils/utils';

interface IOptions {
  page: number;
  perPage: number;
  query: string;
}

const Projects: FunctionComponent<{
  instance: IPluginInstance;
  options: IOptions;
  setOptions: (options: IOptions) => void;
}> = ({ instance, options, setOptions }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IResponseProjects, APIError>(
    ['sonarqube/porjects', instance, options],
    async () => {
      return apiContext.client.get<IResponseProjects>(
        `/api/plugins/sonarqube/projects?query=${encodeURIComponent(options.query)}&page=${options.page}&perPage=${
          options.perPage
        }`,
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
      errorTitle="Failed to projects"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || !data.components || data.components.length === 0}
      noDataTitle="No projects were found"
      noDataMessage="No projects were found for the provided query"
      refetch={refetch}
    >
      {data?.components?.map((component, index) => (
        <Accordion key={component.key} TransitionProps={{ unmountOnExit: true }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>{component.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Measures instance={instance} project={component.key} />
          </AccordionDetails>
        </Accordion>
      ))}

      <Pagination
        count={data?.paging.total ?? 0}
        page={options.page ?? 1}
        perPage={options.perPage ?? 10}
        handleChange={(page, perPage) => setOptions({ ...options, page: page, perPage: perPage })}
      />
    </UseQueryWrapper>
  );
};

const SonarQubePageToolbar: FunctionComponent<{ options: IOptions; setOptions: (options: IOptions) => void }> = ({
  options,
  setOptions,
}) => {
  const [query, setQuery] = useState<string>(options.query ?? '');

  /**
   * `handleSubmit` handles the submit of the toolbar
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setOptions({ ...options, page: 1, query: query });
  };

  /**
   * `handleClear` is the action which is executed when a user clicks the clear button in the search field. When the
   * action is executed we set the search term to an empty string and we adjust the options accordingly.
   */
  const handleClear = () => {
    setQuery('');
    setOptions({ ...options, page: 1, query: '' });
  };

  useEffect(() => {
    setQuery(options.query);
  }, [options.query]);

  return (
    <Toolbar>
      <ToolbarItem grow={true}>
        <Box component="form" onSubmit={handleSubmit}>
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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Box>
      </ToolbarItem>
    </Toolbar>
  );
};

const SonarQubePage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const [options, setOptions] = useQueryState<IOptions>({
    page: 1,
    perPage: 10,
    query: '',
  });

  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
      toolbar={<SonarQubePageToolbar options={options} setOptions={setOptions} />}
    >
      <Projects instance={instance} options={options} setOptions={setOptions} />
    </Page>
  );
};

export default SonarQubePage;
