import {
  addStateHistoryItem,
  Editor,
  GridContextProvider,
  IOptionsAdditionalFields,
  IPluginInstance,
  IPluginPageProps,
  ITimes,
  Options,
  Page,
  pluginBasePath,
  Toolbar,
  ToolbarItem,
  TTime,
  useQueryState,
} from '@kobsio/core';
import { MoreVert } from '@mui/icons-material';
import { IconButton, InputAdornment, ListItemText, Menu, MenuItem } from '@mui/material';
import { FunctionComponent, MouseEvent, useEffect } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Metrics } from './Metrics';
import { QueryHistory } from './QueryHistory';

import { description } from '../utils/utils';

interface IOptions {
  query: string;
  time: TTime;
  timeEnd: number;
  timeStart: number;
}

const MetricsActions: FunctionComponent<{ instance: IPluginInstance }> = ({ instance }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton size="small" onClick={handleOpen} aria-label="open menu">
        <MoreVert />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem component={Link} to={`${pluginBasePath(instance)}`}>
          <ListItemText>Logs</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

const MetricsToolbar: FunctionComponent<{
  instance: IPluginInstance;
  options: IOptions;
  setOptions: (options: IOptions) => void;
}> = ({ instance, options, setOptions }) => {
  const [query, setQuery] = useState<string>(options.query);

  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined) => {
    addStateHistoryItem('kobs-datadog-queryhistory-metrics', query);
    setOptions({
      ...options,
      ...times,
      query: query,
    });
  };

  const handleSubmit = () => {
    addStateHistoryItem('kobs-datadog-queryhistory-metrics', query);
    setOptions({ ...options, query: query });
  };

  useEffect(() => {
    setQuery(options.query);
  }, [options.query]);

  return (
    <Toolbar>
      <ToolbarItem grow={true}>
        <Editor
          language="datadog"
          minimal={true}
          value={query}
          onChange={(value) => setQuery(value)}
          handleSubmit={handleSubmit}
          adornment={
            <InputAdornment position="end">
              <QueryHistory
                historyKey="kobs-datadog-queryhistory-metrics"
                optionsQuery={options.query}
                setQuery={(query) => setQuery(query)}
              />
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

const MetricsPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
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
      toolbar={<MetricsToolbar instance={instance} options={options} setOptions={setOptions} />}
      actions={<MetricsActions instance={instance} />}
    >
      <GridContextProvider autoHeight={true}>
        <Metrics
          title="Result"
          instance={instance}
          query={options.query}
          times={options}
          setTimes={(times: ITimes) => setOptions({ ...options, ...times })}
        />
      </GridContextProvider>
    </Page>
  );
};

export default MetricsPage;
