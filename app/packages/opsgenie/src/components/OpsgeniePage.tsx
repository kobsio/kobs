import {
  IOptionsAdditionalFields,
  IPluginPageProps,
  ITimes,
  Options,
  Page,
  Toolbar,
  ToolbarItem,
  useQueryState,
} from '@kobsio/core';
import { Clear, Search } from '@mui/icons-material';
import { Box, IconButton, InputAdornment, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { FormEvent, FunctionComponent, useEffect, useState } from 'react';

import Alerts from './Alerts';
import Incidents from './Incidents';

import { description } from '../utils/utils';

interface IOptions extends ITimes {
  query: string;
  type: 'alerts' | 'incidents';
}

const OpsgeniePageToolbar: FunctionComponent<{ options: IOptions; setOptions: (options: IOptions) => void }> = ({
  options,
  setOptions,
}) => {
  const [query, setQuery] = useState<string>(options.query ?? '');

  /**
   * `handleSubmit` handles the submit of the toolbar
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setOptions({ ...options, query: query });
  };

  /**
   * `handleClear` is the action which is executed when a user clicks the clear button in the search field. When the
   * action is executed we set the search term to an empty string and we adjust the options accordingly.
   */
  const handleClear = () => {
    setQuery('');
    setOptions({ ...options, query: '' });
  };

  /**
   * `changeOptions` is the function which is passed to the `Options` component, to call the `setOptions` function when
   * a user clicks on the search button, to change the selected time range.
   */
  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined) => {
    setOptions({ ...times, query: query, type: options.type });
  };

  useEffect(() => {
    setQuery(options.query);
  }, [options.query]);

  return (
    <Toolbar>
      <ToolbarItem>
        <ToggleButtonGroup
          size="small"
          value={options.type}
          exclusive={true}
          onChange={(_, value) => setOptions({ ...options, type: value })}
        >
          <ToggleButton sx={{ px: 4 }} value="alerts">
            Alerts
          </ToggleButton>
          <ToggleButton sx={{ px: 4 }} value="incidents">
            Incidents
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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Box>
      </ToolbarItem>
      <ToolbarItem>
        <Options times={options} showOptions={true} showSearchButton={false} setOptions={changeOptions} />
      </ToolbarItem>
    </Toolbar>
  );
};

const OpsgeniePage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const [options, setOptions] = useQueryState<IOptions>({
    query: 'status: open',
    time: 'last1Day',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 86400,
    type: 'alerts',
  });

  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
      toolbar={<OpsgeniePageToolbar options={options} setOptions={setOptions} />}
    >
      {options.type === 'alerts' ? (
        <Alerts instance={instance} query={options.query} times={options} />
      ) : options.type === 'incidents' ? (
        <Incidents instance={instance} query={options.query} times={options} />
      ) : null}
    </Page>
  );
};

export default OpsgeniePage;
