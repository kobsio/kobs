import { Add, Search } from '@mui/icons-material';
import { Box, Button, InputAdornment, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { FormEvent, FunctionComponent, useState } from 'react';
import { Link } from 'react-router-dom';

import Teams from './Teams';
import { ITeamOptions } from './utils';

import useQueryState from '../../utils/hooks/useQueryState';
import Page from '../utils/Page';
import { Toolbar, ToolbarItem } from '../utils/Toolbar';

/**
 * The `TeamsPage` component is used to render a list of teams within a React Router route. By default it only shows
 * teams a user is a member of, but it is also possible to show all teams (when a user has the necessary permissions).
 * The teams can also be filtered by a search team, which should match the teams id.
 */
const TeamsPage: FunctionComponent = () => {
  const [options, setOptions] = useQueryState<ITeamOptions>({
    all: false,
    page: 1,
    perPage: 10,
    searchTerm: '',
  });
  const [searchTerm, setSearchTerm] = useState<string>(options.searchTerm ?? '');

  /**
   * `handleSubmit` handles the submission of the toolbar form, when a user has entered a search term. When the search
   * term changes we also have to set the page options to their initial values.
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setOptions((prevOptions) => ({ ...prevOptions, page: 1, perPage: 10, searchTerm: searchTerm }));
  };

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
              onChange={(_, value) =>
                setOptions((prevOptions) => ({ ...prevOptions, all: value ?? false, page: 1, perPage: 10 }))
              }
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
        <Button variant="contained" color="primary" size="small" startIcon={<Add />} component={Link} to="/todo">
          Add Team
        </Button>
      }
    >
      <Teams options={options} setOptions={setOptions} />
    </Page>
  );
};

export default TeamsPage;
