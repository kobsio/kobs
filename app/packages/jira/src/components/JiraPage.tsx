import {
  IPluginInstance,
  IPluginPageProps,
  ITimes,
  Page,
  Toolbar,
  ToolbarItem,
  pluginBasePath,
  useQueryState,
} from '@kobsio/core';
import { Clear, Dashboard, MoreVert, Search } from '@mui/icons-material';
import {
  Box,
  Grid,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { FormEvent, FunctionComponent, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { IssuesWrapper, Issues } from './Issues';
import { Projects } from './Projects';

import { AuthContextProvider } from '../context/AuthContext';
import { description } from '../utils/utils';

const OverviewPageActions: FunctionComponent<{ instance: IPluginInstance }> = ({ instance }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <MoreVert />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem component={Link} to={`${pluginBasePath(instance)}/search`}>
          <ListItemIcon>
            <Search fontSize="small" />
          </ListItemIcon>
          <ListItemText>Search</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

const OverviewPage: FunctionComponent<{ instance: IPluginInstance }> = ({ instance }) => {
  const times: ITimes = {
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  };

  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
      actions={<OverviewPageActions instance={instance} />}
    >
      <AuthContextProvider title="" instance={instance}>
        <Grid container={true} spacing={6}>
          <Grid item={true} xs={12} md={8}>
            <Stack width="100% " direction="column" spacing={6}>
              <Box sx={{ display: 'flex' }}>
                <IssuesWrapper
                  title="Your Issues"
                  instance={instance}
                  jql="sprint in openSprints() and assignee = currentUser() order by updatedDate"
                  times={times}
                />
              </Box>
              <Box sx={{ display: 'flex' }}>
                <IssuesWrapper
                  title="Current Issues"
                  instance={instance}
                  jql="sprint in openSprints() order by updatedDate"
                  times={times}
                />
              </Box>
            </Stack>
          </Grid>

          <Grid item={true} xs={12} md={4}>
            <Box sx={{ display: 'flex' }}>
              <Projects title="Projects" instance={instance} times={times} />
            </Box>
          </Grid>
        </Grid>
      </AuthContextProvider>
    </Page>
  );
};

interface ISearchOptions {
  jql: string;
  page: number;
  perPage: number;
}

const SearchPageActions: FunctionComponent<{ instance: IPluginInstance }> = ({ instance }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <MoreVert />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem component={Link} to={`${pluginBasePath(instance)}`}>
          <ListItemIcon>
            <Dashboard fontSize="small" />
          </ListItemIcon>
          <ListItemText>Overview</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

const SearchToolbar: FunctionComponent<{ options: ISearchOptions; setOptions: (options: ISearchOptions) => void }> = ({
  options,
  setOptions,
}) => {
  const [jql, setJql] = useState<string>(options.jql ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setOptions({ ...options, jql: jql, page: 1 });
  };

  const handleClear = () => {
    setJql('');
    setOptions({ ...options, jql: '', page: 1 });
  };

  useEffect(() => {
    setJql(options.jql ?? '');
  }, [options]);

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
            value={jql}
            onChange={(e) => setJql(e.target.value)}
          />
        </Box>
      </ToolbarItem>
    </Toolbar>
  );
};

const SearchPage: FunctionComponent<{ instance: IPluginInstance }> = ({ instance }) => {
  const times: ITimes = {
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  };

  const [options, setOptions] = useQueryState<ISearchOptions>({
    jql: '',
    page: 1,
    perPage: 10,
  });

  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
      toolbar={<SearchToolbar options={options} setOptions={setOptions} />}
      actions={<SearchPageActions instance={instance} />}
    >
      <AuthContextProvider title="" instance={instance}>
        <Issues
          title="Result"
          instance={instance}
          jql={options.jql}
          page={options}
          setPage={(page, perPage) => setOptions({ ...options, page: page, perPage: perPage })}
          times={times}
        />
      </AuthContextProvider>
    </Page>
  );
};

const JiraPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  return (
    <Routes>
      <Route path="/" element={<OverviewPage instance={instance} />} />
      <Route path="/search" element={<SearchPage instance={instance} />} />
    </Routes>
  );
};

export default JiraPage;
