import {
  APIContext,
  APIError,
  IAPIContext,
  IPluginInstance,
  IPluginPanelProps,
  ITimes,
  PluginPanel,
  PluginPanelActionLinks,
  PluginPanelError,
  UseQueryWrapper,
  encodeQueryState,
  pluginBasePath,
} from '@kobsio/core';
import { Box, Tab, Tabs } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, useState } from 'react';

import { Logs } from './Logs';
import { Metrics } from './Metrics';

import { IBuckets, IDocument, ILogData, example } from '../utils/utils';

interface IOptions {
  queries?: IOptionsQuery[];
  query?: string;
  showChart?: boolean;
  type?: string;
}

interface IOptionsQuery {
  fields?: string[];
  name?: string;
  query?: string;
}

const LogsPanelQuery: FunctionComponent<{
  instance: IPluginInstance;
  query: IOptionsQuery;
  setTimes: (times: ITimes) => void;
  showChart: boolean;
  times: ITimes;
}> = ({ instance, query, times, showChart, setTimes }) => {
  const apiContext = useContext<IAPIContext>(APIContext);
  const [page, setPage] = useState<{ page: number; perPage: number }>({ page: 1, perPage: 100 });

  const { isError, isLoading, error, data, refetch } = useQuery<ILogData, APIError>(
    ['datadog/logs', query.query, times.timeStart, times.timeEnd],
    async () => {
      const path = `/api/plugins/datadog/logs?query=${encodeURIComponent(query.query ?? '')}&timeStart=${
        times.timeStart
      }&timeEnd=${times.timeEnd}`;

      const data = await apiContext.client.get<{ buckets: IBuckets[]; logs: IDocument[] }>(path, {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });

      return {
        buckets: data.buckets,
        documents: data.logs,
        fields: [],
      };
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      isError={isError}
      isLoading={isLoading}
      refetch={refetch}
      errorTitle="Failed to get logs"
      isNoData={!data || !data.documents || data.documents.length === 0}
      noDataTitle="No logs were found"
      noDataMessage="No logs were found for the provided query in the provided time range."
    >
      <Logs
        data={data}
        selectedFields={query.fields ?? []}
        page={page.page}
        perPage={page.perPage}
        setPage={(page, perPage) => setPage({ page: page, perPage: perPage })}
        showChart={showChart}
        setTimes={setTimes}
      />
    </UseQueryWrapper>
  );
};

const LogsPanel: FunctionComponent<{
  instance: IPluginInstance;
  queries: IOptionsQuery[];
  setTimes: (times: ITimes) => void;
  showChart: boolean;
  times: ITimes;
}> = ({ instance, queries, showChart, times, setTimes }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (queries.length === 1) {
    return (
      <LogsPanelQuery instance={instance} query={queries[0]} showChart={showChart} times={times} setTimes={setTimes} />
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
            <LogsPanelQuery instance={instance} query={query} showChart={showChart} times={times} setTimes={setTimes} />
          )}
        </Box>
      ))}
    </>
  );
};

const DatadogPanel: FunctionComponent<IPluginPanelProps<IOptions>> = ({
  title,
  description,
  options,
  instance,
  times,
  setTimes,
}) => {
  if (options?.type === 'logs' && options.queries && Array.isArray(options.queries) && options.queries.length > 0) {
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
            isFetching={false}
          />
        }
      >
        <LogsPanel
          instance={instance}
          queries={options.queries}
          showChart={options.showChart || false}
          times={times}
          setTimes={setTimes}
        />
      </PluginPanel>
    );
  }

  if (options?.type === 'metrics' && options.query) {
    return (
      <Metrics
        title={title}
        description={description}
        instance={instance}
        query={options.query}
        times={times}
        setTimes={setTimes}
      />
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Invalid options for Datadog plugin"
      details="One of the required options is missing."
      example={example}
      documentation="https://kobs.io/main/plugins/datadog"
    />
  );
};

export default DatadogPanel;
