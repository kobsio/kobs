import { IPluginPageProps, Page, Toolbar, ToolbarItem, useQueryState } from '@kobsio/core';
import { Clear, Search } from '@mui/icons-material';
import { Box, IconButton, InputAdornment, TextField } from '@mui/material';
import { FormEvent, FunctionComponent, useState } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';

import Artifacts from './Artifacts';
import Projects from './Projects';
import Repositories from './Repositories';

import { description } from '../utils/utils';

interface IOptions {
  query?: string;
}

const PageToolbar: FunctionComponent<{ options: IOptions; setOptions: (data: IOptions) => void }> = ({
  options,
  setOptions,
}) => {
  const [query, setQuery] = useState<string>(options.query ?? '');

  /**
   * `handleSubmit` handles the submit of the toolbar. During the submit we call the provided `setOptions` function.
   * This is required to pass the users selected query to the parent component.
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setOptions({ query: query });
  };

  /**
   * `handleClear` is the action which is executed when a user clicks the clear button in the search field. When the
   * action is executed we set the search term to an empty string and we adjust the options accordingly.
   */
  const handleClear = () => {
    setQuery('');
    setOptions({ ...options, query: '' });
  };

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

const ProjectsPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
    >
      <Projects instance={instance} />
    </Page>
  );
};

interface IRepositoriesPageParams extends Record<string, string | undefined> {
  projectName?: string;
}

const RepositoriesPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const params = useParams<IRepositoriesPageParams>();
  const [options, setOptions] = useQueryState<IOptions>({ query: '' });

  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
      toolbar={<PageToolbar options={options} setOptions={setOptions} />}
    >
      <Repositories instance={instance} projectName={params.projectName ?? ''} query={options.query || ''} />
    </Page>
  );
};

interface IArtifactsPageParams extends Record<string, string | undefined> {
  projectName?: string;
  repositoryName?: string;
}

const ArtifactsPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const params = useParams<IArtifactsPageParams>();
  const [options, setOptions] = useQueryState<IOptions>({ query: '' });

  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
      toolbar={<PageToolbar options={options} setOptions={setOptions} />}
    >
      <Artifacts
        instance={instance}
        projectName={params.projectName ?? ''}
        repositoryName={params.repositoryName ?? ''}
        query={options.query || ''}
      />
    </Page>
  );
};

const HarborPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  return (
    <Routes>
      <Route path="/" element={<ProjectsPage instance={instance} />} />
      <Route path="/:projectName" element={<RepositoriesPage instance={instance} />} />
      <Route path="/:projectName/:repositoryName" element={<ArtifactsPage instance={instance} />} />
    </Routes>
  );
};

export default HarborPage;
