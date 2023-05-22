import {
  addStateHistoryItem,
  Editor,
  getStateHistory,
  IOptionsAdditionalFields,
  IPluginInstance,
  IPluginPageProps,
  ITimes,
  Options,
  Page,
  Toolbar,
  ToolbarItem,
  useLocalStorageState,
  useQueryState,
  useUpdate,
} from '@kobsio/core';
import { ManageSearch, Refresh } from '@mui/icons-material';
import { Alert, AlertTitle, Button, IconButton, InputAdornment, Menu, MenuItem, Typography } from '@mui/material';
import { FunctionComponent, MouseEvent, useEffect, useMemo, useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import Agents from './Agents';
import Overview from './Overview';
import Requests from './Requests';
import { SiteSelect } from './SiteSelect';

import { description } from '../utils/utils';

const RequestsHistory: FunctionComponent<{ optionsQuery: string; setQuery: (query: string) => void }> = ({
  optionsQuery,
  setQuery,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  /**
   * `queries` is a list of queries which are saved in the history. We refresh the list of queries each time the
   * provided `optionsQuery` (from the `options.query` property) are changed, because this means that the user
   * executed a new request and a new query was added to the history. This way we can save some unnecessary calls to the
   * `getStateHistory` function.
   */
  const queries = useMemo(() => {
    return getStateHistory('kobs-signalsciences-queryhistory');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionsQuery]);

  /**
   * `handleOpen` opens the menu, which is used to display the history, with all queries which were executed by a user
   * in the past.
   */
  const handleOpen = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  /**
   * `handleClose` closes the menu, wich displays the history, with all queries which were executed by a user in the
   * past.
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * `handleSelect` handles the selection of a query in the history menu. The query will be passed to the `setQuery`
   * function and the menu will be closed.
   */
  const handleSelect = (query: string) => {
    handleClose();
    setQuery(query);
  };

  if (queries.length === 0) {
    return null;
  }

  return (
    <>
      <IconButton size="small" onClick={handleOpen}>
        <ManageSearch />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {queries.map((query, index) => (
          <MenuItem key={index} onClick={() => handleSelect(query)}>
            <Typography noWrap={true}>{query}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

interface IRequestsPageOptions extends ITimes {
  page: number;
  perPage: number;
  query: string;
  site: string;
}

const RequestsPageToolbar: FunctionComponent<{
  instance: IPluginInstance;
  options: IRequestsPageOptions;
  setOptions: (options: IRequestsPageOptions) => void;
}> = ({ instance, options, setOptions }) => {
  const [query, setQuery] = useState<string>(options.query);

  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined) => {
    addStateHistoryItem('kobs-signalsciences-queryhistory', query);
    setOptions({ ...options, ...times, page: 1, query: query });
  };

  const handleSubmit = () => {
    addStateHistoryItem('kobs-signalsciences-queryhistory', query);
    setOptions({ ...options, page: 1, query: query });
  };

  return (
    <Toolbar>
      <ToolbarItem width="250px">
        <SiteSelect
          instance={instance}
          selectedSite={options.site}
          selectSite={(site) => setOptions({ ...options, site: site })}
        />
      </ToolbarItem>
      <ToolbarItem grow={true}>
        <Editor
          language="signalsciences"
          minimal={true}
          value={query}
          onChange={(value) => setQuery(value)}
          handleSubmit={() => handleSubmit()}
          adornment={
            <InputAdornment position="end">
              <RequestsHistory optionsQuery={options.query} setQuery={(query) => setQuery(query)} />
            </InputAdornment>
          }
        />
      </ToolbarItem>
      <ToolbarItem align="right">
        <Options times={options} showOptions={true} showSearchButton={true} setOptions={changeOptions} />
      </ToolbarItem>
    </Toolbar>
  );
};

const RequestsPage: FunctionComponent<{ instance: IPluginInstance }> = ({ instance }) => {
  const [persistedOptions, setPersistedOptions] = useLocalStorageState<{ site: string }>(
    'kobs-signalsciences-requestspage-options',
    {
      site: '',
    },
  );
  const [options, setOptions] = useQueryState<IRequestsPageOptions>({
    page: 1,
    perPage: 10,
    query: '',
    site: persistedOptions.site,
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  });

  /**
   * `useEffect` is used to persist the site, when it is changed by a user.
   */
  useEffect(() => {
    setPersistedOptions({ site: options.site });
  }, [options.site, setPersistedOptions]);

  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
      toolbar={<RequestsPageToolbar instance={instance} options={options} setOptions={setOptions} />}
    >
      {!options.site ? (
        <Alert severity="info">
          <AlertTitle>Select a site</AlertTitle>
          You have to select a site in the toolbar.
        </Alert>
      ) : (
        <Requests
          instance={instance}
          times={options}
          site={options.site}
          query={options.query}
          page={options.page}
          perPage={options.perPage}
          setPage={(page, perPage) => setOptions((prevOptions) => ({ ...prevOptions, page: page, perPage: perPage }))}
        />
      )}
    </Page>
  );
};

const AgentsPage: FunctionComponent<{ instance: IPluginInstance }> = ({ instance }) => {
  const update = useUpdate();
  const [persistedOptions, setPersistedOptions] = useLocalStorageState<{ site: string }>(
    'kobs-signalsciences-agentspage-options',
    {
      site: '',
    },
  );
  const [options, setOptions] = useQueryState<{ site: string }>(persistedOptions);

  /**
   * `useEffect` is used to persist the options, when they are changed by a user.
   */
  useEffect(() => {
    setPersistedOptions(options);
  }, [options, setPersistedOptions]);

  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
      toolbar={
        <Toolbar>
          <ToolbarItem grow={true}>
            <SiteSelect
              instance={instance}
              selectedSite={options.site}
              selectSite={(site) => setOptions({ site: site })}
            />
          </ToolbarItem>
          <ToolbarItem>
            <Button variant="contained" color="primary" onClick={() => update()}>
              <Refresh />
            </Button>
          </ToolbarItem>
        </Toolbar>
      }
    >
      {!options.site ? (
        <Alert severity="info">
          <AlertTitle>Select a site</AlertTitle>
          You have to select a site in the toolbar.
        </Alert>
      ) : (
        <Agents
          instance={instance}
          times={{
            time: 'last15Minutes',
            timeEnd: Math.floor(Date.now() / 1000),
            timeStart: Math.floor(Date.now() / 1000) - 900,
          }}
          site={options.site}
        />
      )}
    </Page>
  );
};

const OverviewPage: FunctionComponent<{ instance: IPluginInstance }> = ({ instance }) => {
  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
    >
      <Overview
        instance={instance}
        times={{
          time: 'last7Days',
          timeEnd: Math.floor(Date.now() / 1000),
          timeStart: Math.floor(Date.now() / 1000) - 604800,
        }}
      />
    </Page>
  );
};

const SignalSciencesPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  return (
    <Routes>
      <Route path="/" element={<OverviewPage instance={instance} />} />
      <Route path="/requests" element={<RequestsPage instance={instance} />} />
      <Route path="/agents" element={<AgentsPage instance={instance} />} />
    </Routes>
  );
};

export default SignalSciencesPage;
