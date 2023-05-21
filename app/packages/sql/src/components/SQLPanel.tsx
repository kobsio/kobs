import {
  IPluginInstance,
  IPluginPanelProps,
  ITimes,
  PluginPanel,
  PluginPanelActionLinks,
  PluginPanelError,
  encodeQueryState,
  pluginBasePath,
} from '@kobsio/core';
import { Box, Tab, Tabs } from '@mui/material';
import { FunctionComponent, useState } from 'react';

import { SQLChart } from './SQLChart';
import SQLTable from './SQLTable';

import { IChart, IColumns, example } from '../utils/utils';

interface IOptions {
  chart?: IChart;
  queries?: IOptionsQuery[];
  type?: string;
}

interface IOptionsQuery {
  columns?: IColumns;
  name?: string;
  query?: string;
}

const TablePanel: FunctionComponent<{
  instance: IPluginInstance;
  queries: IOptionsQuery[];
  times: ITimes;
}> = ({ instance, queries, times }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (queries.length === 1) {
    return (
      <SQLTable
        instance={instance}
        query={queries[0].query ?? ''}
        columnOptions={queries[0].columns}
        isPanel={true}
        times={times}
      />
    );
  }

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs variant="scrollable" scrollButtons={false} value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          {queries.map((query, index) => (
            <Tab key={index} label={query.name} value={index} />
          ))}
        </Tabs>
      </Box>

      {queries.map((query, index) => (
        <Box key={index} hidden={activeTab !== index} sx={{ pt: 2 }}>
          {activeTab === index && (
            <SQLTable
              instance={instance}
              query={query.query ?? ''}
              columnOptions={query.columns}
              isPanel={true}
              times={times}
            />
          )}
        </Box>
      ))}
    </>
  );
};

const Panel: FunctionComponent<IPluginPanelProps<IOptions>> = ({ title, description, options, instance, times }) => {
  if (options && options.type === 'table' && Array.isArray(options.queries) && options.queries.length > 0) {
    return (
      <PluginPanel
        title={title}
        description={description}
        actions={
          <PluginPanelActionLinks
            links={options.queries.map((query) => ({
              link: `${pluginBasePath(instance)}?${encodeQueryState({
                ...query,
                ...times,
              })}`,
              title: `Explore ${query.name}`,
            }))}
          />
        }
      >
        <TablePanel instance={instance} queries={options.queries} times={times} />
      </PluginPanel>
    );
  }

  if (options && options.type === 'chart' && options.chart && options.chart.type && options.chart.query) {
    return (
      <PluginPanel
        title={title}
        description={description}
        actions={
          <PluginPanelActionLinks
            links={[
              {
                link: `${pluginBasePath(instance)}?${encodeQueryState({
                  query: options.chart.query,
                  ...times,
                })}`,
                title: 'Explore',
              },
            ]}
          />
        }
      >
        <SQLChart instance={instance} chart={options.chart} times={times} />
      </PluginPanel>
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Invalid options for SQL plugin"
      details="One of the required options is missing or invalid."
      example={example}
      documentation="https://kobs.io/main/plugins/sql"
    />
  );
};

export default Panel;
