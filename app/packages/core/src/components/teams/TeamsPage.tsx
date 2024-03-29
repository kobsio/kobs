import { Add, Clear, Search } from '@mui/icons-material';
import { Box, Button, IconButton, InputAdornment, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { FormEvent, FunctionComponent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Teams from './Teams';
import { ITeamOptions } from './utils';

import { useLocalStorageState } from '../../utils/hooks/useLocalStorageState';
import { useQueryState } from '../../utils/hooks/useQueryState';
import { Page } from '../utils/Page';
import { Toolbar, ToolbarItem } from '../utils/Toolbar';

/**
 * The `TeamsPage` component is used to render a list of teams within a React Router route. By default it only shows
 * teams a user is a member of, but it is also possible to show all teams (when a user has the necessary permissions).
 * The teams can also be filtered by a search team, which should match the teams id.
 */
const TeamsPage: FunctionComponent = () => {
  const [persistedOptions, setPersistedOptions] = useLocalStorageState<ITeamOptions>('kobs-core-teamspage-options', {
    all: false,
    page: 1,
    perPage: 10,
    searchTerm: '',
  });
  const [options, setOptions] = useQueryState<ITeamOptions>(persistedOptions);
  const [searchTerm, setSearchTerm] = useState<string>(options.searchTerm ?? '');

  /**
   * `handleSubmit` handles the submission of the toolbar form, when a user has entered a search term. When the search
   * term changes we also have to set the page options to their initial values.
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setOptions((prevOptions) => ({ ...prevOptions, page: 1, searchTerm: searchTerm }));
  };

  /**
   * handleClear` is the action which is executed when a user clicks the clear button in the search field. When the
   * action is executed we set the search term to an empty string and we adjust the options accordingly.
   */
  const handleClear = () => {
    setSearchTerm('');
    setOptions((prevOptions) => ({ ...prevOptions, page: 1, searchTerm: '' }));
  };

  /**
   * `useEffect` is used to persist the options, when they are changed by a user.
   */
  useEffect(() => {
    setPersistedOptions(options);
  }, [options, setPersistedOptions]);

  return (
    <Page
      title="Teams"
      description="A list of your / all teams. You can search for teams by providing the name of the team."
      toolbar={
        <Toolbar>
          <ToolbarItem>
            <ToggleButtonGroup
              size="small"
              value={options.all}
              exclusive={true}
              onChange={(_, value) => setOptions((prevOptions) => ({ ...prevOptions, all: value ?? false, page: 1 }))}
            >
              <ToggleButton sx={{ px: 4 }} value={false}>
                Owned
              </ToggleButton>
              <ToggleButton sx={{ px: 4 }} value={true}>
                All
              </ToggleButton>
            </ToggleButtonGroup>
          </ToolbarItem>
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Box>
          </ToolbarItem>
        </Toolbar>
      }
      actions={
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<Add />}
          component={Link}
          to={`/edit/team?state=${encodeURIComponent(
            btoa(
              JSON.stringify({
                cluster: 'default',
                id: 'default@example.com',
                name: 'default',
                namespace: 'default',
              }),
            ),
          )}`}
        >
          Add Team
        </Button>
      }
    >
      <Teams isPanel={false} options={options} setOptions={setOptions} />
    </Page>
  );
};

export default TeamsPage;
