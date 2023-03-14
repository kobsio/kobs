import {
  IPluginInstance,
  PluginPanel,
  PluginPanelActionLinks,
  IPluginPanelProps,
  PluginPanelError,
} from '@kobsio/core';
import { Paper, Tab, Tabs } from '@mui/material';
import queryString from 'query-string';
import { FunctionComponent, useState } from 'react';

import LogsQueryView from './LogsPanel';

export interface IQuery {
  fields: string[];
  name: string;
  query: string;
}

interface IOptions {
  queries: IQuery[];
}

interface ITabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: FunctionComponent<ITabPanelProps> = ({ index, value, children }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`}>
      {value === index && children}
    </div>
  );
};

const uriFromQuery = (instance: IPluginInstance, query: IQuery) => {
  const path = `/plugins/${instance.cluster}/klogs/${instance.name}`;
  const search = queryString.stringify(
    {
      fields: query.fields,
      query: query.query,
    },
    { arrayFormat: 'bracket', skipEmptyString: false, skipNull: false },
  );

  return [path, search].join('?');
};

const isString = (v: unknown) => typeof v === 'string';

const isValid = (options?: IOptions): options is IOptions => {
  if (!options) {
    return false;
  }

  if (!Array.isArray(options.queries)) {
    return false;
  }

  for (const query of options.queries) {
    if (!Array.isArray(query.fields)) {
      return false;
    }
    for (const field of query.fields) {
      if (!isString(field)) {
        return false;
      }
    }

    if (!isString(query.query)) {
      return false;
    }

    if (!isString(query.name)) {
      return false;
    }
  }

  return true;
};

const Panel: FunctionComponent<IPluginPanelProps<IOptions>> = ({
  description,
  instance,
  options,
  setTimes,
  times,
  title,
}) => {
  const [tab, setTab] = useState(0);
  if (!isValid(options)) {
    return (
      <PluginPanelError
        title={title}
        description={description}
        message="Invalid options for KLogs plugin"
        details="One of the required options: 'queries' is incorrect"
        example={`plugin:
  name: klogs
  type: klogs
  options:
  queries:
    - fields: ["app"]
      query: "namespace='kube-system'`}
        documentation="https://kobs.io/main/plugins/klogs/#panel-options"
      />
    );
  }

  // todo maybe this should also trogger the pluginpanelerror
  if (options.queries.length === 0) {
    return <></>;
  }

  if (options.queries.length === 1) {
    const query = options.queries[0];
    return (
      <PluginPanel
        title={title}
        actions={
          <PluginPanelActionLinks
            links={[
              {
                link: uriFromQuery(instance, query),
                title: `explore "${query.name}"`,
              },
            ]}
            isFetching={false}
          />
        }
      >
        <LogsQueryView instance={instance} query={query} setTimes={setTimes} times={times} />
      </PluginPanel>
    );
  }

  return (
    <PluginPanel
      title={title}
      actions={
        <PluginPanelActionLinks
          links={options.queries.map((query) => ({
            link: uriFromQuery(instance, query),
            title: `explore "${query.name}"`,
          }))}
          isFetching={false}
        />
      }
    >
      <Paper sx={{ height: '100%', width: '100%' }}>
        <Tabs
          value={tab}
          onChange={(e, value: number) => setTab(value)}
          aria-label="selects the search query"
          sx={{ mb: 2 }}
        >
          {options.queries.map((query, i) => (
            <Tab key={i} label={query.name} id={query.name} aria-controls={`tab-query-${i}`} />
          ))}
        </Tabs>
        {options.queries.map((query, i) => (
          <TabPanel key={i} index={i} value={tab}>
            <LogsQueryView instance={instance} query={query} setTimes={setTimes} times={times} />
          </TabPanel>
        ))}
      </Paper>
    </PluginPanel>
  );
};

export default Panel;
