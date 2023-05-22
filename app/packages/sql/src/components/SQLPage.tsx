import {
  addStateHistoryItem,
  APIContext,
  APIError,
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
  useQueryState,
} from '@kobsio/core';
import { ManageSearch } from '@mui/icons-material';
import {
  Card,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, MouseEvent, useContext, useEffect, useMemo, useState } from 'react';

import SQLTable from './SQLTable';

import { description } from '../utils/utils';

interface IOptions extends ITimes {
  query: string;
}

export const SQLPageQueryHistory: FunctionComponent<{ optionsQuery: string; setQuery: (query: string) => void }> = ({
  optionsQuery,
  setQuery,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  /**
   * `queries` is a list of queries which are saved in the history. We refresh the list of queries each time the
   * provided `optionsQuery` (from the `options.query` property) is changed, because this means that the user executed a
   * new request and a new query was added to the history. This way we can save some unnecessary calls to the
   * `getStateHistory` function.
   */
  const queries = useMemo(() => {
    return getStateHistory('kobs-sql-queryhistory');
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
      <IconButton size="small" onClick={handleOpen} data-testid="sql-query-history">
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

const SQLPageToolbar: FunctionComponent<{
  instance: IPluginInstance;
  options: IOptions;
  setOptions: (options: IOptions) => void;
}> = ({ instance, options, setOptions }) => {
  const [query, setQuery] = useState<string>(options.query);
  const apiContext = useContext(APIContext);

  const { data } = useQuery<
    {
      completions: Record<string, string[]>;
      dialect: 'postgres' | 'mysql' | 'clickhouse' | 'sql';
    },
    APIError
  >(['sql/meta', instance], () => {
    return apiContext.client.get<{
      completions: Record<string, string[]>;
      dialect: 'postgres' | 'mysql' | 'clickhouse' | 'sql';
    }>(`/api/plugins/sql/meta`, {
      headers: {
        'x-kobs-cluster': instance.cluster,
        'x-kobs-plugin': instance.name,
      },
    });
  });

  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined) => {
    addStateHistoryItem('kobs-sql-queryhistory', query);
    setOptions({
      ...times,
      query: query,
    });
  };

  const handleSubmit = () => {
    addStateHistoryItem('kobs-sql-queryhistory', query);
    setOptions({ ...options, query: query });
  };

  useEffect(() => {
    setQuery(options.query);
  }, [options]);

  return (
    <Toolbar>
      <ToolbarItem grow={true}>
        {data && (
          <Editor
            language="sql"
            languageOptions={{
              completions: data?.completions,
              dialect: data?.dialect,
            }}
            minimal={true}
            value={query}
            onChange={(value) => setQuery(value)}
            handleSubmit={handleSubmit}
            adornment={
              <InputAdornment position="end">
                <SQLPageQueryHistory optionsQuery={options.query} setQuery={(query) => setQuery(query)} />
              </InputAdornment>
            }
          />
        )}
      </ToolbarItem>
      <ToolbarItem align="right">
        <Options showOptions={false} showSearchButton={true} times={options} setOptions={changeOptions} />
      </ToolbarItem>
    </Toolbar>
  );
};

const SQLPageTableSelect: FunctionComponent<{ instance: IPluginInstance; onSelectTable: (table: string) => void }> = ({
  instance,
  onSelectTable,
}) => {
  const apiContext = useContext(APIContext);

  const { data } = useQuery<
    {
      completions: Record<string, string[]>;
      dialect: 'postgres' | 'mysql' | 'clickhouse' | 'sql';
    },
    APIError
  >(['sql/meta', instance], () => {
    return apiContext.client.get<{
      completions: Record<string, string[]>;
      dialect: 'postgres' | 'mysql' | 'clickhouse' | 'sql';
    }>(`/api/plugins/sql/meta`, {
      headers: {
        'x-kobs-cluster': instance.cluster,
        'x-kobs-plugin': instance.name,
      },
    });
  });

  return (
    <List sx={{ wordBreak: 'break-all' }} dense={true} subheader={<li />}>
      <Typography fontWeight="bold" p={2}>
        Tables
      </Typography>
      <Divider />

      {data?.completions &&
        Object.keys(data.completions).map((table) => (
          <ListItem key={table} disablePadding={true}>
            <ListItemButton onClick={() => onSelectTable(table)} aria-label={table}>
              <ListItemText primary={table} />
            </ListItemButton>
          </ListItem>
        ))}
    </List>
  );
};

const SQLPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const [options, setOptions] = useQueryState<IOptions>({
    query: '',
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  });

  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
      toolbar={<SQLPageToolbar instance={instance} options={options} setOptions={setOptions} />}
    >
      <Grid spacing={6} container={true}>
        <Grid xs={12} md={2} item={true}>
          <Card>
            <SQLPageTableSelect
              instance={instance}
              onSelectTable={(table) => setOptions({ ...options, query: `SELECT * FROM ${table} LIMIT 100` })}
            />
          </Card>
        </Grid>
        <Grid xs={12} md={10} item={true}>
          <SQLTable instance={instance} query={options.query} isPanel={false} times={options} />
        </Grid>
      </Grid>
    </Page>
  );
};

export default SQLPage;
