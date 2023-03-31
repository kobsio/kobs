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

import { MonitorOperations, MonitorServiceCalls, MonitorServiceErrors, MonitorServiceLatency } from './Monitor';
import { Traces } from './Traces';

import { spanKinds } from '../utils/utils';

export interface IOptions {
  metrics?: {
    service?: string;
    spanKinds?: string[];
    type: string;
  };
  queries?: {
    limit?: string;
    maxDuration?: string;
    minDuration?: string;
    name?: string;
    operation?: string;
    service?: string;
    tags?: string;
  }[];
  showChart?: boolean;
}

const TracesWrapper: FunctionComponent<{
  instance: IPluginInstance;
  queries: {
    limit?: string;
    maxDuration?: string;
    minDuration?: string;
    name?: string;
    operation?: string;
    service?: string;
    tags?: string;
  }[];
  showChart?: boolean;
  times: ITimes;
}> = ({ instance, queries, times, showChart }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (queries.length === 1) {
    return (
      <Traces
        instance={instance}
        limit={queries[0].limit || '20'}
        maxDuration={queries[0].maxDuration || ''}
        minDuration={queries[0].minDuration || ''}
        operation={queries[0].operation || ''}
        service={queries[0].service || ''}
        showChart={showChart || false}
        tags={queries[0].tags || ''}
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
            <Traces
              instance={instance}
              limit={queries[0].limit || '20'}
              maxDuration={queries[0].maxDuration || ''}
              minDuration={queries[0].minDuration || ''}
              operation={queries[0].operation || ''}
              service={queries[0].service || ''}
              showChart={showChart || false}
              tags={queries[0].tags || ''}
              times={times}
            />
          )}
        </Box>
      ))}
    </>
  );
};

const JaegerPanel: FunctionComponent<IPluginPanelProps<IOptions>> = ({
  title,
  description,
  options,
  instance,
  times,
}) => {
  if (options && options.queries && Array.isArray(options.queries) && options.queries.length > 0) {
    return (
      <PluginPanel
        title={title}
        description={description}
        actions={
          <PluginPanelActionLinks
            links={options.queries.map((query) => ({
              link: `${pluginBasePath(instance)}/?limit=${query.limit || '20'}&maxDuration=${
                query.maxDuration || ''
              }&minDuration=${query.minDuration || ''}&operation=${query.operation || ''}&service=${
                query.service || ''
              }&tags=${query.tags || ''}&time=${times.time}&timeEnd=${times.timeEnd}&timeStart=${times.timeStart}`,
              title: `Explore: ${query.name}`,
            }))}
          />
        }
      >
        <TracesWrapper
          instance={instance}
          showChart={options.showChart || false}
          queries={options.queries}
          times={times}
        />
      </PluginPanel>
    );
  }

  if (options && options.metrics && options.metrics.type && options.metrics.service) {
    const sk =
      options.metrics.spanKinds && Array.isArray(options.metrics.spanKinds) && options.metrics.spanKinds.length > 0
        ? options.metrics.spanKinds
        : spanKinds;

    if (options.metrics.type === 'servicelatency') {
      return (
        <MonitorServiceLatency
          instance={instance}
          title={title}
          description={description}
          service={options.metrics.service}
          spanKinds={sk}
          showActions={true}
          times={times}
        />
      );
    }

    if (options.metrics.type === 'serviceerrors') {
      return (
        <MonitorServiceErrors
          instance={instance}
          title={title}
          description={description}
          service={options.metrics.service}
          spanKinds={sk}
          showActions={true}
          times={times}
        />
      );
    }

    if (options.metrics.type === 'servicecalls') {
      return (
        <MonitorServiceCalls
          instance={instance}
          title={title}
          description={description}
          service={options.metrics.service}
          spanKinds={sk}
          showActions={true}
          times={times}
        />
      );
    }

    if (options.metrics.type === 'operations') {
      return (
        <MonitorOperations
          instance={instance}
          title={title}
          description={description}
          service={options.metrics.service}
          spanKinds={sk}
          showActions={true}
          times={times}
        />
      );
    }
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Invalid options for Jaeger plugin"
      details="One of the required options is missing."
      example={`# View a list of traces
plugin:
  name: jaeger
  type: jaeger
  options:
    showChart: true
    queries:
      - name: All Requests
        service: productpage.bookinfo
# View the metrics of a service
plugin:
  name: jaeger
  type: jaeger
  options:
    metrics:
      # The type must be "servicelatency", "serviceerrors", "servicecalls" or "operations".
      type: servicelatency
      service: productpage.bookinfo`}
      documentation="https://kobs.io/main/plugins/jaeger"
    />
  );
};

export default JaegerPanel;
