import {
  IPluginInstance,
  IPluginPanelProps,
  ITimes,
  pluginBasePath,
  PluginPanel,
  PluginPanelActionLinks,
  PluginPanelError,
} from '@kobsio/core';
import { Box, Tab, Tabs } from '@mui/material';
import { FunctionComponent, useState } from 'react';

import Alerts from './Alerts';
import Incidents from './Incidents';

import { example } from '../utils/utils';

interface IOptions {
  interval?: number;
  queries?: string[];
  type?: string;
}

const IncidentsWrapper: FunctionComponent<{
  instance: IPluginInstance;
  interval?: number;
  queries: string[];
  times: ITimes;
}> = ({ instance, queries, times, interval }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (queries.length === 1) {
    return <Incidents instance={instance} query={queries[0]} times={times} interval={interval} />;
  }

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs variant="scrollable" scrollButtons={false} value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          {queries.map((query, index) => (
            <Tab key={index} label={query} value={index} />
          ))}
        </Tabs>
      </Box>

      {queries.map((query, index) => (
        <Box key={index} hidden={activeTab !== index} sx={{ pt: 2 }}>
          {activeTab === index && <Incidents instance={instance} query={query} times={times} interval={interval} />}
        </Box>
      ))}
    </>
  );
};

const AlertsWrapper: FunctionComponent<{
  instance: IPluginInstance;
  interval?: number;
  queries: string[];
  times: ITimes;
}> = ({ instance, queries, times, interval }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (queries.length === 1) {
    return <Alerts instance={instance} query={queries[0]} times={times} interval={interval} />;
  }

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs variant="scrollable" scrollButtons={false} value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          {queries.map((query, index) => (
            <Tab key={index} label={query} value={index} />
          ))}
        </Tabs>
      </Box>

      {queries.map((query, index) => (
        <Box key={index} hidden={activeTab !== index} sx={{ pt: 2 }}>
          {activeTab === index && <Alerts instance={instance} query={query} times={times} interval={interval} />}
        </Box>
      ))}
    </>
  );
};

const OpsgeniePanel: FunctionComponent<IPluginPanelProps<IOptions>> = ({
  title,
  description,
  options,
  instance,
  times,
}) => {
  if (options && options.type === 'alerts' && options.queries && options.queries.length > 0) {
    return (
      <PluginPanel
        title={title}
        description={description}
        actions={
          <PluginPanelActionLinks
            links={options.queries.map((query) => ({
              link: `${pluginBasePath(instance)}?type=alerts&query=${encodeURIComponent(query)}&time=${
                times.time
              }&timeEnd=${times.timeEnd}&timeStart=${times.timeStart}`,
              title: `Explore: ${query}`,
            }))}
          />
        }
      >
        <AlertsWrapper instance={instance} interval={options.interval} queries={options.queries} times={times} />
      </PluginPanel>
    );
  }

  if (options && options.type === 'incidents' && options.queries && options.queries.length > 0) {
    return (
      <PluginPanel
        title={title}
        description={description}
        actions={
          <PluginPanelActionLinks
            links={options.queries.map((query) => ({
              link: `${pluginBasePath(instance)}?type=incidents&query=${encodeURIComponent(query)}&time=${
                times.time
              }&timeEnd=${times.timeEnd}&timeStart=${times.timeStart}`,
              title: `Explore: ${query}`,
            }))}
          />
        }
      >
        <IncidentsWrapper instance={instance} interval={options.interval} queries={options.queries} times={times} />
      </PluginPanel>
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Invalid options for Opsgenie plugin"
      details="One of the required options is missing."
      example={example}
      documentation="https://kobs.io/main/plugins/opsgenie"
    />
  );
};

export default OpsgeniePanel;
