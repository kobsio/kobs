import {
  APIClient,
  APIContext,
  APIError,
  ChartTooltip,
  chartTheme,
  chartTickFormatTime,
  chartTickFormatValue,
  DetailsDrawer,
  IAPIContext,
  IPluginInstance,
  ITimes,
  Pagination,
  pluginBasePath,
  PluginPanel,
  PluginPanelActionLinks,
  roundNumber,
  useDimensions,
  UseQueryWrapper,
  formatTime,
  chartColors,
} from '@kobsio/core';
import { Clear, ScatterPlot, Search } from '@mui/icons-material';
import {
  useTheme,
  Box,
  TableRow,
  TableCell,
  TableHead,
  TableContainer,
  Table,
  TableBody,
  darken,
  TableSortLabel,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { FormEvent, FunctionComponent, useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { VictoryAxis, VictoryChart, VictoryGroup, VictoryLine, VictoryVoronoiContainer } from 'victory';

/**
 * `IMetrics` is the JSON format which is returned by the Jaeger API for a metrics call.
 */
interface IMetrics {
  help?: string;
  metrics?: IMetric[];
  name?: string;
  type?: string;
}

interface IMetric {
  labels?: IMetricLabel[];
  metricPoints?: IMetricPoint[];
}

interface IMetricLabel {
  name?: string;
  value?: string;
}

interface IMetricPoint {
  gaugeValue?: IMetricGaugeValue;
  timestamp?: string;
}

interface IMetricGaugeValue {
  doubleValue?: number | string;
}

/**
 * `IChartData` is the interface for the chart data which is used to render the chart.
 */
interface IChartData {
  color: string;
  data: IChartDatum[];
  name: string;
}

interface IChartDatum {
  color: string;
  name: string;
  x: Date;
  y: number | null;
}

/**
 * `IOperationData` is the interface for the converted data, returned by the Jaeger API, which we use to render the
 * table of operations.
 */
interface IOperationData {
  avgs: number[];
  chartData: IChartData[];
  impact: number;
  operation: string;
}

/**
 * `getRatePerAndStepParameters` returns the `ratePer` and `step` query parameters, so that they can be directly used in
 * the url of the API call. This is used to ensure that we always return 50 datapoints for all metrics.
 */
const getRatePerAndStepParameters = (times: ITimes): string => {
  const steps = (times.timeEnd - times.timeStart) / 50;
  return `&ratePer=${steps * 10000}&step=${steps * 1000}`;
};

/**
 * `useGetServiceLatency` is a custom React Hook to run the queries to get the P50, P75 and P95 latency of a service in
 * parallel.
 */
const useGetServiceLatency = (
  apiClient: APIClient,
  instance: IPluginInstance,
  service: string,
  spanKinds: string[],
  times: ITimes,
): [UseQueryResult<IMetrics, APIError>, UseQueryResult<IMetrics, APIError>, UseQueryResult<IMetrics, APIError>] => {
  const p50 = useQuery<IMetrics, APIError>(
    ['jaeger/metrics/latencies/service', instance, service, spanKinds, times, 0.5],
    () => getServiceLatency(apiClient, instance, service, spanKinds, times, 0.5),
  );
  const p75 = useQuery<IMetrics, APIError>(
    ['jaeger/metrics/latencies/service', instance, service, spanKinds, times, 0.75],
    () => getServiceLatency(apiClient, instance, service, spanKinds, times, 0.75),
  );
  const p95 = useQuery<IMetrics, APIError>(
    ['jaeger/metrics/latencies/service', instance, service, spanKinds, times, 0.95],
    () => getServiceLatency(apiClient, instance, service, spanKinds, times, 0.95),
  );
  return [p50, p75, p95];
};

const getServiceLatency = async (
  apiClient: APIClient,
  instance: IPluginInstance,
  service: string,
  spanKinds: string[],
  times: ITimes,
  quantile: number,
): Promise<IMetrics> => {
  const sk = spanKinds.map((spanKind) => `&spanKind=${spanKind}`);

  return apiClient.get<IMetrics>(
    `/api/plugins/jaeger/metrics?metric=latencies&service=${service}${
      sk.length > 0 ? sk.join('') : ''
    }&quantile=${quantile}&groupByOperation=false${getRatePerAndStepParameters(times)}&timeStart=${
      times.timeStart
    }&timeEnd=${times.timeEnd}`,
    {
      headers: {
        'x-kobs-cluster': instance.cluster,
        'x-kobs-plugin': instance.name,
      },
    },
  );
};

const serviceMetricsToChartData = (metrics: { metrics?: IMetrics; name: string }[]): IChartData[] => {
  const chartData: IChartData[] = [];

  let i = 0;

  for (const metric of metrics) {
    if (!metric.metrics || !metric.metrics.metrics || metric.metrics.metrics.length !== 1) {
      chartData.push({ color: chartColors[i], data: [], name: metric.name });
    } else {
      const data: IChartDatum[] = [];

      if (metric.metrics.metrics && metric.metrics.metrics.length > 0 && metric.metrics.metrics[0].metricPoints) {
        for (const metricPoint of metric.metrics.metrics[0].metricPoints) {
          data.push({
            color: chartColors[i],
            name: metric.name,
            x: new Date(metricPoint.timestamp ?? 0),
            y:
              typeof metricPoint.gaugeValue?.doubleValue === 'number'
                ? metric.name === 'Errors'
                  ? metricPoint.gaugeValue.doubleValue * 100
                  : metricPoint.gaugeValue.doubleValue
                : null,
          });
        }
      }

      chartData.push({ color: chartColors[i], data: data, name: metric.name });
    }

    i++;
  }

  return chartData;
};

/**
 * `useGetOperationMetrics` is a custom React Hook to run the queries to get the P50, P75 and P95 latency and the error
 * rate and calls of each operation for a service.
 */
const useGetOperationMetrics = (
  apiClient: APIClient,
  instance: IPluginInstance,
  service: string,
  spanKinds: string[],
  times: ITimes,
): [
  UseQueryResult<IMetrics, APIError>,
  UseQueryResult<IMetrics, APIError>,
  UseQueryResult<IMetrics, APIError>,
  UseQueryResult<IMetrics, APIError>,
  UseQueryResult<IMetrics, APIError>,
] => {
  const p50 = useQuery<IMetrics, APIError>(
    ['jaeger/metrics/latencies/operations', instance, service, spanKinds, times, 0.5],
    () => getOperationMetrics(apiClient, instance, service, spanKinds, times, 'latencies', 0.5),
  );
  const p75 = useQuery<IMetrics, APIError>(
    ['jaeger/metrics/latencies/operations', instance, service, spanKinds, times, 0.75],
    () => getOperationMetrics(apiClient, instance, service, spanKinds, times, 'latencies', 0.75),
  );
  const p95 = useQuery<IMetrics, APIError>(
    ['jaeger/metrics/latencies/operations', instance, service, spanKinds, times, 0.95],
    () => getOperationMetrics(apiClient, instance, service, spanKinds, times, 'latencies', 0.95),
  );
  const errors = useQuery<IMetrics, APIError>(
    ['jaeger/metrics/errors/operations', instance, service, spanKinds, times],
    () => getOperationMetrics(apiClient, instance, service, spanKinds, times, 'errors'),
  );
  const calls = useQuery<IMetrics, APIError>(
    ['jaeger/metrics/calls/operations', instance, service, spanKinds, times],
    () => getOperationMetrics(apiClient, instance, service, spanKinds, times, 'calls'),
  );
  return [p50, p75, p95, errors, calls];
};

const getOperationMetrics = async (
  apiClient: APIClient,
  instance: IPluginInstance,
  service: string,
  spanKinds: string[],
  times: ITimes,
  metric: string,
  quantile?: number,
): Promise<IMetrics> => {
  const sk = spanKinds.map((spanKind) => `&spanKind=${spanKind}`);

  return apiClient.get<IMetrics>(
    `/api/plugins/jaeger/metrics?metric=${metric}&service=${service}${sk.length > 0 ? sk.join('') : ''}${
      quantile ? `&quantile=${quantile}` : ''
    }&groupByOperation=true${getRatePerAndStepParameters(times)}&timeStart=${times.timeStart}&timeEnd=${times.timeEnd}`,
    {
      headers: {
        'x-kobs-cluster': instance.cluster,
        'x-kobs-plugin': instance.name,
      },
    },
  );
};

const operationMetricsToData = (metrics: { metrics?: IMetrics; name: string }[]): IOperationData[] => {
  const operationData: IOperationData[] = [];
  const operations: Record<string, IOperationData> = {};

  let i = 0;

  for (const metric of metrics) {
    if (metric.metrics && metric.metrics.metrics) {
      for (const operationMetric of metric.metrics.metrics) {
        const operationName =
          operationMetric.labels?.filter((label) => label.name === 'operation').length === 1
            ? operationMetric.labels.filter((label) => label.name === 'operation')[0].value
            : '';

        if (operationName !== '') {
          let count = 0;
          let total = 0;

          const data: IChartDatum[] = [];

          if (operationMetric.metricPoints) {
            for (const metricPoint of operationMetric.metricPoints) {
              if (typeof metricPoint.gaugeValue?.doubleValue === 'number') {
                count = count + 1;
                total = total + metricPoint.gaugeValue.doubleValue;
              } else if (metric.name === 'Errors') {
                count = count + 1;
              }

              data.push({
                color: chartColors[i],
                name: metric.name,
                x: new Date(metricPoint.timestamp ?? 0),
                y:
                  typeof metricPoint.gaugeValue?.doubleValue === 'number'
                    ? metric.name === 'Errors'
                      ? metricPoint.gaugeValue.doubleValue * 100
                      : metricPoint.gaugeValue.doubleValue
                    : null,
              });
            }
          }

          if (operationName && operationName in operations) {
            operations[operationName].avgs[i] =
              metric.name === 'Errors' ? roundNumber((total / count) * 100) : roundNumber(total / count);
            operations[operationName].chartData[i] = { color: chartColors[i], data: data, name: metric.name };
          } else {
            const avgs: number[] = [0, 0, 0, 0, 0];
            const chartData: IChartData[] = [
              { color: chartColors[i], data: [], name: 'P50' },
              { color: chartColors[i], data: [], name: 'P75' },
              { color: chartColors[i], data: [], name: 'P95' },
              { color: chartColors[i], data: [], name: 'Errors' },
              { color: chartColors[i], data: [], name: 'Calls' },
            ];

            avgs[i] = metric.name === 'Errors' ? roundNumber((total / count) * 100) : roundNumber(total / count);
            chartData[i] = { color: chartColors[i], data: data, name: metric.name };

            if (operationName && i === 0)
              operations[operationName] = {
                avgs: avgs,
                chartData: chartData,
                impact: 0,
                operation: operationName,
              };
          }
        }
      }
    }

    i++;
  }

  for (const operation in operations) {
    operationData.push({
      ...operations[operation],
      impact:
        operations[operation].avgs[2] && operations[operation].avgs[4]
          ? operations[operation].avgs[2] * operations[operation].avgs[4]
          : 0,
    });
  }

  operationData.sort((a, b) => (a.impact > b.impact ? -1 : a.impact < b.impact ? 1 : 0));

  return operationData;
};

const MonitorChart: FunctionComponent<{
  data: IChartData[];
  times: ITimes;
  unit: string;
}> = ({ data, times, unit }) => {
  const theme = useTheme();
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  return (
    <Box height="calc(100% - 5px)" width="100%" ref={refChart}>
      <VictoryChart
        theme={chartTheme(theme)}
        containerComponent={
          <VictoryVoronoiContainer
            labels={() => ' '}
            labelComponent={
              <ChartTooltip
                height={chartSize.height}
                width={chartSize.width}
                legendData={({ datum }: { datum: IChartDatum }) => ({
                  color: datum.color,
                  label: datum.name,
                  title: formatTime(datum.x),
                  unit: unit,
                  value: datum.y ? roundNumber(datum.y, 4) : 'N/A',
                })}
              />
            }
            mouseFollowTooltips={true}
          />
        }
        height={chartSize.height}
        padding={{ bottom: 25, left: unit ? 60 : 55, right: 0, top: 0 }}
        scale={{ x: 'time', y: 'linear' }}
        width={chartSize.width}
        domain={{ x: [new Date(times.timeStart * 1000), new Date(times.timeEnd * 1000)] }}
      >
        <VictoryAxis dependentAxis={false} tickFormat={chartTickFormatTime} />
        <VictoryAxis dependentAxis={true} label={unit} tickFormat={chartTickFormatValue} />

        <VictoryGroup>
          {data.map((metric) => (
            <VictoryLine
              key={metric.name}
              data={metric.data}
              name={metric.name}
              colorScale={[metric.color]}
              interpolation="monotoneX"
            />
          ))}
        </VictoryGroup>
      </VictoryChart>
    </Box>
  );
};

export const MonitorServiceLatency: FunctionComponent<{
  description?: string;
  instance: IPluginInstance;
  service: string;
  showActions: boolean;
  spanKinds: string[];
  times: ITimes;
  title: string;
}> = ({ title, description, instance, service, spanKinds, showActions, times }) => {
  const apiContext = useContext<IAPIContext>(APIContext);
  const latencies = useGetServiceLatency(apiContext.client, instance, service, spanKinds, times);

  return (
    <PluginPanel
      title={title}
      description={description}
      actions={
        showActions && (
          <PluginPanelActionLinks
            links={[
              {
                link: `${pluginBasePath(instance)}/monitor?service=${service}${spanKinds
                  .map((spanKind) => `&spanKinds[]=${spanKind}`)
                  .join('')}&time=${times.time}&timeEnd=${times.timeEnd}&timeStart=${times.timeStart}`,
                title: 'Explore',
              },
            ]}
          />
        )
      }
    >
      <UseQueryWrapper
        error={latencies[0].error || latencies[1].error || latencies[2].error}
        errorTitle="Failed to get service latency metrics"
        isError={latencies[0].isError || latencies[1].isError || latencies[2].isError}
        isLoading={latencies[0].isLoading || latencies[1].isLoading || latencies[2].isLoading}
        isNoData={
          !latencies[0].data ||
          !latencies[1].data ||
          !latencies[2].data ||
          !latencies[0].data.metrics ||
          !latencies[1].data.metrics ||
          !latencies[2].data.metrics ||
          latencies[0].data.metrics.length === 0 ||
          latencies[1].data.metrics.length === 0 ||
          latencies[2].data.metrics.length === 0
        }
        noDataTitle="No metrics were found"
      >
        <MonitorChart
          data={serviceMetricsToChartData([
            { metrics: latencies[0].data, name: 'P50' },
            { metrics: latencies[1].data, name: 'P75' },
            { metrics: latencies[2].data, name: 'P95' },
          ])}
          unit="ms"
          times={times}
        />
      </UseQueryWrapper>
    </PluginPanel>
  );
};

export const MonitorServiceErrors: FunctionComponent<{
  description?: string;
  instance: IPluginInstance;
  service: string;
  showActions: boolean;
  spanKinds: string[];
  times: ITimes;
  title: string;
}> = ({ title, description, instance, service, spanKinds, showActions, times }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data } = useQuery<IMetrics, APIError>(
    ['jaeger/metrics/errors/service', instance, service, spanKinds, times],
    async () => {
      const sk = spanKinds.map((spanKind) => `&spanKind=${spanKind}`);

      return apiContext.client.get<IMetrics>(
        `/api/plugins/jaeger/metrics?metric=errors&service=${service}${
          sk.length > 0 ? sk.join('') : ''
        }&groupByOperation=false${getRatePerAndStepParameters(times)}&timeStart=${times.timeStart}&timeEnd=${
          times.timeEnd
        }`,
        {
          headers: {
            'x-kobs-cluster': instance.cluster,
            'x-kobs-plugin': instance.name,
          },
        },
      );
    },
  );

  return (
    <PluginPanel
      title={title}
      description={description}
      actions={
        showActions && (
          <PluginPanelActionLinks
            links={[
              {
                link: `${pluginBasePath(instance)}/monitor?service=${service}${spanKinds
                  .map((spanKind) => `&spanKinds[]=${spanKind}`)
                  .join('')}&time=${times.time}&timeEnd=${times.timeEnd}&timeStart=${times.timeStart}`,
                title: 'Explore',
              },
            ]}
          />
        )
      }
    >
      <UseQueryWrapper
        error={error}
        errorTitle="Failed to get service error metrics"
        isError={isError}
        isLoading={isLoading}
        isNoData={!data || !data.metrics || data.metrics.length === 0}
        noDataTitle="No metrics were found"
      >
        <MonitorChart data={serviceMetricsToChartData([{ metrics: data, name: 'Errors' }])} unit="%" times={times} />
      </UseQueryWrapper>
    </PluginPanel>
  );
};

export const MonitorServiceCalls: FunctionComponent<{
  description?: string;
  instance: IPluginInstance;
  service: string;
  showActions: boolean;
  spanKinds: string[];
  times: ITimes;
  title: string;
}> = ({ title, description, instance, service, spanKinds, showActions, times }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data } = useQuery<IMetrics, APIError>(
    ['jaeger/metrics/errors/service', instance, service, spanKinds, times],
    async () => {
      const sk = spanKinds.map((spanKind) => `&spanKind=${spanKind}`);

      return apiContext.client.get<IMetrics>(
        `/api/plugins/jaeger/metrics?metric=calls&service=${service}${
          sk.length > 0 ? sk.join('') : ''
        }&groupByOperation=false${getRatePerAndStepParameters(times)}&timeStart=${times.timeStart}&timeEnd=${
          times.timeEnd
        }`,
        {
          headers: {
            'x-kobs-cluster': instance.cluster,
            'x-kobs-plugin': instance.name,
          },
        },
      );
    },
  );

  return (
    <PluginPanel
      title={title}
      description={description}
      actions={
        showActions && (
          <PluginPanelActionLinks
            links={[
              {
                link: `${pluginBasePath(instance)}/monitor?service=${service}${spanKinds
                  .map((spanKind) => `&spanKinds[]=${spanKind}`)
                  .join('')}&time=${times.time}&timeEnd=${times.timeEnd}&timeStart=${times.timeStart}`,
                title: 'Explore',
              },
            ]}
          />
        )
      }
    >
      <UseQueryWrapper
        error={error}
        errorTitle="Failed to get service calls metrics"
        isError={isError}
        isLoading={isLoading}
        isNoData={!data || !data.metrics || data.metrics.length === 0}
        noDataTitle="No metrics were found"
      >
        <MonitorChart data={serviceMetricsToChartData([{ metrics: data, name: 'Calls' }])} unit="req/s" times={times} />
      </UseQueryWrapper>
    </PluginPanel>
  );
};

export const MonitorOperations: FunctionComponent<{
  description?: string;
  instance: IPluginInstance;
  service: string;
  showActions: boolean;
  spanKinds: string[];
  times: ITimes;
  title: string;
}> = ({ title, description, instance, service, spanKinds, showActions, times }) => {
  const apiContext = useContext<IAPIContext>(APIContext);
  const metrics = useGetOperationMetrics(apiContext.client, instance, service, spanKinds, times);

  return (
    <PluginPanel
      title={title}
      description={description}
      actions={
        showActions && (
          <PluginPanelActionLinks
            links={[
              {
                link: `${pluginBasePath(instance)}/monitor?service=${service}${spanKinds
                  .map((spanKind) => `&spanKinds[]=${spanKind}`)
                  .join('')}&time=${times.time}&timeEnd=${times.timeEnd}&timeStart=${times.timeStart}`,
                title: 'Explore',
              },
            ]}
          />
        )
      }
    >
      <UseQueryWrapper
        error={metrics[1].error || metrics[2].error || metrics[3].error || metrics[4].error}
        errorTitle="Failed to get service operations"
        isError={metrics[1].isError || metrics[2].isError || metrics[3].isError || metrics[4].isError}
        isLoading={
          metrics[0].isLoading ||
          metrics[1].isLoading ||
          metrics[2].isLoading ||
          metrics[3].isLoading ||
          metrics[4].isLoading
        }
        isNoData={
          !metrics[0].data ||
          !metrics[1].data ||
          !metrics[2].data ||
          !metrics[3].data ||
          !metrics[4].data ||
          !metrics[0].data.metrics ||
          !metrics[1].data.metrics ||
          !metrics[2].data.metrics ||
          !metrics[3].data.metrics ||
          !metrics[4].data.metrics ||
          metrics[0].data.metrics.length === 0 ||
          metrics[1].data.metrics.length === 0 ||
          metrics[2].data.metrics.length === 0 ||
          metrics[3].data.metrics.length === 0 ||
          metrics[4].data.metrics.length === 0
        }
        noDataTitle="No metrics were found"
      >
        <MonitorOperationsTable
          instance={instance}
          service={service}
          data={operationMetricsToData([
            { metrics: metrics[0].data, name: 'P50' },
            { metrics: metrics[1].data, name: 'P75' },
            { metrics: metrics[2].data, name: 'P95' },
            { metrics: metrics[3].data, name: 'Errors' },
            { metrics: metrics[4].data, name: 'Calls' },
          ])}
          times={times}
        />
      </UseQueryWrapper>
    </PluginPanel>
  );
};

/**
 * `TOrder` is our type, which represents the different orders we are supporting. These are ascending (`asc`) and
 * deascending `desc`.
 */
type TOrder = 'asc' | 'desc';

/**
 * `TOrderBy` is our type, after which we can order the returned operations.
 */
type TOrderBy = 'operation' | 'impact' | 0 | 1 | 2 | 3 | 4;

/**
 * `IOrder` is the interface which combins the `TOrder` and `TOrderBy` types into one type, so we only have one state
 * change, when we update the values.
 */
interface IOrder {
  order: TOrder;
  orderBy: TOrderBy;
}

const MonitorOperationsTable: FunctionComponent<{
  data: IOperationData[];
  instance: IPluginInstance;
  service: string;
  times: ITimes;
}> = ({ data, instance, service, times }) => {
  const theme = useTheme();
  const [options, setOptions] = useState<{ filter: string; page: number; perPage: number }>({
    filter: '',
    page: 1,
    perPage: 10,
  });
  const [order, setOrder] = useState<IOrder>({ order: 'desc', orderBy: 'impact' });
  const [sortedData, setSortedData] = useState<IOperationData[]>(data);
  const [selectedOperation, setSelectedOperation] = useState<IOperationData | undefined>(undefined);

  /**
   * `handleOrder` updates the `order` of the metrics based on the provided `orderBy` value.
   */
  const handleOrder = (orderBy: TOrderBy) => {
    const isAsc = order.orderBy === orderBy && order.order === 'asc';
    setOrder({
      order: isAsc ? 'desc' : 'asc',
      orderBy: orderBy,
    });
  };

  useEffect(() => {
    const tmpData = [...data];
    if (order.order === 'asc') {
      if (order.orderBy === 'operation' || order.orderBy === 'impact') {
        const orderBy = order.orderBy as 'operation' | 'impact';
        tmpData.sort((a, b) => (a[orderBy] > b[orderBy] ? 1 : a[orderBy] < b[orderBy] ? -1 : 0));
      } else {
        const orderBy = order.orderBy as 0 | 1 | 2 | 3 | 4;
        tmpData.sort((a, b) => (a.avgs[orderBy] > b.avgs[orderBy] ? 1 : a.avgs[orderBy] < b.avgs[orderBy] ? -1 : 0));
      }
    } else {
      if (order.orderBy === 'operation' || order.orderBy === 'impact') {
        const orderBy = order.orderBy as 'operation' | 'impact';
        tmpData.sort((a, b) => (a[orderBy] < b[orderBy] ? 1 : a[orderBy] > b[orderBy] ? -1 : 0));
      } else {
        const orderBy = order.orderBy as 0 | 1 | 2 | 3 | 4;
        tmpData.sort((a, b) => (a.avgs[orderBy] < b.avgs[orderBy] ? 1 : a.avgs[orderBy] > b.avgs[orderBy] ? -1 : 0));
      }
    }
    setSortedData(tmpData);
  }, [order, data]);

  const impact = Math.max(...data.map((operation) => operation.impact));

  return (
    <>
      <MonitorOperationsToolbar
        operation={options.filter}
        setOperation={(operation) => setOptions({ filter: operation, page: 1, perPage: options.perPage })}
      />

      <TableContainer sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sortDirection={order.orderBy === 'operation' ? order.order : false}>
                <TableSortLabel
                  active={order.orderBy === 'operation'}
                  direction={order.orderBy === 'operation' ? order.order : 'asc'}
                  onClick={() => handleOrder('operation')}
                >
                  Operation
                  {order.orderBy === 'operation' ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </Box>
                  ) : null}
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={order.orderBy === 0 ? order.order : false}>
                <TableSortLabel
                  active={order.orderBy === 0}
                  direction={order.orderBy === 0 ? order.order : 'asc'}
                  onClick={() => handleOrder(0)}
                >
                  P50
                  {order.orderBy === 0 ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </Box>
                  ) : null}
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={order.orderBy === 1 ? order.order : false}>
                <TableSortLabel
                  active={order.orderBy === 1}
                  direction={order.orderBy === 1 ? order.order : 'asc'}
                  onClick={() => handleOrder(1)}
                >
                  P75
                  {order.orderBy === 1 ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </Box>
                  ) : null}
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={order.orderBy === 2 ? order.order : false}>
                <TableSortLabel
                  active={order.orderBy === 2}
                  direction={order.orderBy === 2 ? order.order : 'asc'}
                  onClick={() => handleOrder(2)}
                >
                  P95
                  {order.orderBy === 2 ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </Box>
                  ) : null}
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={order.orderBy === 4 ? order.order : false}>
                <TableSortLabel
                  active={order.orderBy === 4}
                  direction={order.orderBy === 4 ? order.order : 'asc'}
                  onClick={() => handleOrder(4)}
                >
                  Request Rate
                  {order.orderBy === 4 ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </Box>
                  ) : null}
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={order.orderBy === 3 ? order.order : false}>
                <TableSortLabel
                  active={order.orderBy === 3}
                  direction={order.orderBy === 3 ? order.order : 'asc'}
                  onClick={() => handleOrder(3)}
                >
                  Error Rate
                  {order.orderBy === 3 ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </Box>
                  ) : null}
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={order.orderBy === 'impact' ? order.order : false}>
                <TableSortLabel
                  active={order.orderBy === 'impact'}
                  direction={order.orderBy === 'impact' ? order.order : 'asc'}
                  onClick={() => handleOrder('impact')}
                >
                  Impact
                  {order.orderBy === 'impact' ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </Box>
                  ) : null}
                </TableSortLabel>
              </TableCell>

              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData
              .filter((operation) => operation.operation.toLowerCase().includes(options.filter.toLowerCase()))
              .slice((options.page - 1) * options.perPage, options.page * options.perPage)
              .map((operation) => (
                <TableRow
                  key={operation.operation}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  hover={true}
                  selected={selectedOperation?.operation === operation.operation}
                >
                  <TableCell sx={{ cursor: 'pointer' }} onClick={() => setSelectedOperation(operation)}>
                    {operation.operation}
                  </TableCell>
                  <TableCell sx={{ cursor: 'pointer' }} onClick={() => setSelectedOperation(operation)}>
                    {operation.avgs[0] ? `${operation.avgs[0]} ms` : '-'}
                  </TableCell>
                  <TableCell sx={{ cursor: 'pointer' }} onClick={() => setSelectedOperation(operation)}>
                    {operation.avgs[1] ? `${operation.avgs[1]} ms` : '-'}
                  </TableCell>
                  <TableCell sx={{ cursor: 'pointer' }} onClick={() => setSelectedOperation(operation)}>
                    {operation.avgs[2] ? `${operation.avgs[2]} ms` : '-'}
                  </TableCell>
                  <TableCell sx={{ cursor: 'pointer' }} onClick={() => setSelectedOperation(operation)}>
                    {operation.avgs[4] ? `${operation.avgs[4]} req/s` : '-'}
                  </TableCell>
                  <TableCell sx={{ cursor: 'pointer' }} onClick={() => setSelectedOperation(operation)}>
                    {operation.avgs[3] ? `${operation.avgs[3]} %` : '-'}
                  </TableCell>
                  <TableCell sx={{ cursor: 'pointer' }} onClick={() => setSelectedOperation(operation)}>
                    <div
                      style={{
                        backgroundColor: darken(theme.palette.primary.main, 0.5),
                        height: '12px',
                        width: '200px',
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: theme.palette.primary.main,
                          height: '12px',
                          width: `${200 * (operation.impact / impact)}px`,
                        }}
                      ></div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Traces">
                      <IconButton
                        size="small"
                        component={Link}
                        to={`${pluginBasePath(instance)}?service=${service}&operation=${operation.operation}`}
                      >
                        <ScatterPlot />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        count={data.length ?? 0}
        page={options.page ?? 1}
        perPage={options.perPage ?? 10}
        handleChange={(page, perPage) => setOptions({ ...options, page: page, perPage: perPage })}
      />

      {selectedOperation && (
        <MonitorOperation
          operation={selectedOperation}
          times={times}
          open={selectedOperation !== undefined}
          onClose={() => setSelectedOperation(undefined)}
        />
      )}
    </>
  );
};

const MonitorOperationsToolbar: FunctionComponent<{ operation: string; setOperation: (operation: string) => void }> = ({
  operation,
  setOperation,
}) => {
  const [internalOperation, setInternalOperation] = useState<string>(operation ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setOperation(internalOperation);
  };
  const handleClear = () => {
    setInternalOperation('');
    setOperation('');
  };

  useEffect(() => {
    setInternalOperation(operation ?? '');
  }, [operation]);

  return (
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
        value={internalOperation}
        onChange={(e) => setInternalOperation(e.target.value)}
      />
    </Box>
  );
};

const MonitorOperation: FunctionComponent<{
  onClose: () => void;
  open: boolean;
  operation: IOperationData;
  times: ITimes;
}> = ({ operation, times, onClose, open }) => {
  return (
    <DetailsDrawer size="large" open={open} onClose={onClose} title={operation.operation}>
      <Box height="300px" sx={{ mb: 6 }}>
        <PluginPanel title="Latency (ms)">
          <MonitorChart
            data={[operation.chartData[0], operation.chartData[1], operation.chartData[2]]}
            unit="ms"
            times={times}
          />
        </PluginPanel>
      </Box>
      <Box height="300px" sx={{ mb: 6 }}>
        <PluginPanel title="Error Rate (%)">
          <MonitorChart data={[operation.chartData[3]]} unit="%" times={times} />
        </PluginPanel>
      </Box>
      <Box height="300px" sx={{ mb: 6 }}>
        <PluginPanel title="Request Rate (req/s)">
          <MonitorChart data={[operation.chartData[4]]} unit="req/s" times={times} />
        </PluginPanel>
      </Box>
    </DetailsDrawer>
  );
};
