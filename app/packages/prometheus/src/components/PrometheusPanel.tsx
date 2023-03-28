import {
  APIContext,
  APIError,
  getChartColor,
  IAPIContext,
  IPluginPanelProps,
  ITimes,
  PluginPanel,
  PluginPanelError,
  UseQueryWrapper,
  pluginBasePath,
  PluginPanelActionLinks,
  useDimensions,
  roundNumber,
  IGridContext,
  GridContext,
} from '@kobsio/core';
import { Box, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { VictoryArea, VictoryGroup } from 'victory';

import Chart from './Chart';
import Legend from './Legend';

import { IMetric, IMetrics, IOrder, TOrderBy } from '../utils/utils';

/**
 * `IOptions` is the interface for the options of the Prometheus plugin. The options are provided by a user and should
 * be validated before we use them, because they are not validated within the CRD.
 */
interface IOptions {
  columns?: IColumn[];
  legend?: string;
  mappings?: Record<string, string>;
  queries?: IQuery[];
  sparkline?: string;
  stacked?: boolean;
  type?: string;
  unit?: string;
  yAxis?: IYAxis;
}

interface IQuery {
  label?: string;
  query?: string;
}

interface IColumn {
  mappings?: Record<string, string>;
  name?: string;
  title?: string;
  unit?: string;
}

interface IYAxis {
  max: number;
  min: number;
}

/**
 * `getMappingValue` returns the mapping for the provided `value` from the list of `mappings`.
 */
const getMappingValue = (value: string | number | null | undefined, mappings: Record<string, string>): string => {
  if (!value) {
    return '';
  }

  return mappings[value.toString()];
};

/**
 * `formatCellValue` is used to formate a value in a cell in a table. The value is retrieved by the provided `key` and
 * `column`. If the column contains a list of mappings the corresponding value from the mappings will be shown. If the
 * column is a `value` from a Prometheus query we will show the number.
 */
const formatCellValue = (
  key: string,
  column: IColumn,
  data: Record<string, Record<string, string>> | undefined,
): string | number => {
  if (!column.name || !data) {
    return '';
  }

  if (column.mappings) {
    return getMappingValue(data[key][column.name], column.mappings);
  }

  if (column.name.startsWith('value')) {
    return roundNumber(parseFloat(data[key][column.name]), 4);
  }

  return data[key][column.name];
};

/**
 * The `PrometheusSparkline` is used to render a sparkline chart, when a user selected the corresponding type in the
 * options. A sparkline chart is a simple area chart, without a x and y axis and a label which is shown in the center
 * of the chart.
 */
const PrometheusSparkline: FunctionComponent<{
  mappings?: Record<string, string>;
  metrics: IMetric[];
  queries: IQuery[];
  times: ITimes;
  unit: string | undefined;
  value: string | undefined;
}> = ({ queries, metrics, times, unit, mappings, value }) => {
  const theme = useTheme();
  const gridContext = useContext<IGridContext>(GridContext);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dimensions = useDimensions(wrapperRef);

  /**
   * Determine the label which should be shown above the chart. If the query contains a label we will show the label,
   * if the query doesn't contain a label the min / max / avg / current value of the first metric will be shown or when
   * a list of mappings was defined the corresponding mapping for the value will be shown.
   */
  let label = 'N/A';
  if (metrics.length > 0) {
    if (queries.length > 0 && queries[0].label) {
      if (metrics[0].name) {
        label = metrics[0].name;
      }
    } else {
      if (mappings && Object.keys(mappings).length > 0) {
        label = getMappingValue(metrics[0].current, mappings);
      } else {
        if (value === 'min') {
          label = metrics[0].min === null ? 'N/A' : `${roundNumber(metrics[0].min)} ${unit ? unit : ''}`;
        } else if (value === 'max') {
          label = metrics[0].max === null ? 'N/A' : `${roundNumber(metrics[0].max)} ${unit ? unit : ''}`;
        } else if (value === 'avg') {
          label = metrics[0].avg === null ? 'N/A' : `${roundNumber(metrics[0].avg)} ${unit ? unit : ''}`;
        } else {
          label = metrics[0].current === null ? 'N/A' : `${roundNumber(metrics[0].current)} ${unit ? unit : ''}`;
        }
      }
    }
  }

  return (
    <div style={{ height: gridContext.autoHeight ? '150px' : 'calc(100% - 5px)', position: 'relative' }}>
      <div style={{ height: gridContext.autoHeight ? '145px' : '100%', width: '100%' }} ref={wrapperRef}>
        {dimensions.height > 0 && (
          <VictoryGroup
            color={theme.palette.primary.main}
            height={dimensions.height}
            padding={{ bottom: 0, left: 0, right: 0, top: 0 }}
            scale={{ x: 'time', y: 'linear' }}
            width={dimensions.width}
            domain={{ x: [new Date(times.timeStart * 1000), new Date(times.timeEnd * 1000)] }}
          >
            {metrics.length > 0 && (
              <VictoryArea
                key={metrics[0].name}
                data={metrics[0].data}
                name={metrics[0].name}
                interpolation="monotoneX"
                style={{
                  data: {
                    fillOpacity: 0.5,
                  },
                }}
              />
            )}
          </VictoryGroup>
        )}
      </div>
      {dimensions.height > 0 && (
        <div
          style={{
            fontSize: '24px',
            position: 'absolute',
            textAlign: 'center',
            top: `${dimensions.height / 2}px`,
            width: '100%',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

/**
 * The `PrometheusChart` component is used to render a line, area or bar chart and the legend within a `ChartPanel`. The
 * component handles also the sorting of the provided `metrics` and the selection or a single metric from the `Legend`
 * which should then be shown in the `Chart`.
 */
const PrometheusChart: FunctionComponent<{
  legend: string | undefined;
  metrics: IMetrics;
  setTimes: (times: ITimes) => void;
  stacked: boolean;
  times: ITimes;
  type: 'line' | 'area' | 'bar';
  unit: string | undefined;
  yAxisMax: number | undefined;
  yAxisMin: number | undefined;
}> = ({ metrics, type, legend, stacked, yAxisMin, yAxisMax, times, unit, setTimes }) => {
  const gridContext = useContext<IGridContext>(GridContext);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dimensions = useDimensions(wrapperRef);
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [order, setOrder] = useState<IOrder>({ order: 'asc', orderBy: 'name' });
  const [sortedMetrics, setSortedMetrics] = useState<IMetric[]>(metrics?.metrics ?? []);

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

  /**
   * Everytime the order or the provided metrics are changed we have to sort the metrics and store them in the
   * `sortedMetrics` state.
   */
  useEffect(() => {
    const tmpMetrics = metrics?.metrics ? [...metrics?.metrics] : [];
    if (order.order === 'asc') {
      tmpMetrics.sort((a, b) =>
        a[order.orderBy] > b[order.orderBy] ? 1 : a[order.orderBy] < b[order.orderBy] ? -1 : 0,
      );
    } else {
      tmpMetrics.sort((a, b) =>
        a[order.orderBy] < b[order.orderBy] ? 1 : a[order.orderBy] > b[order.orderBy] ? -1 : 0,
      );
    }
    setSortedMetrics(tmpMetrics);
  }, [order, metrics]);

  return (
    <Box ref={wrapperRef} height={gridContext.autoHeight ? '430px' : '100%'}>
      {dimensions.height > 0 && (
        <Stack direction="column" spacing={2}>
          <Box
            height={
              gridContext.autoHeight
                ? `${350 - 8}px`
                : legend === 'table'
                ? dimensions.height - 80 - 8
                : dimensions.height - 8
            }
          >
            <Chart
              max={yAxisMax ?? metrics.max}
              metrics={
                selectedMetric !== '' ? sortedMetrics.filter((metric) => metric.id === selectedMetric) : sortedMetrics
              }
              min={yAxisMin ?? metrics.min}
              stacked={stacked}
              times={times}
              type={type}
              unit={unit}
              setTimes={setTimes}
            />
          </Box>

          {legend === 'table' && (
            <Box
              height={80}
              sx={{
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                overflowY: 'auto',
              }}
            >
              <Legend
                padding="none"
                metrics={sortedMetrics}
                selectedMetric={selectedMetric}
                setSelectedMetric={setSelectedMetric}
                order={order}
                handleOrder={handleOrder}
              />
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
};

/**
 * The `ChartPanel` component is used to render a chart for a list of user provided queries, when the corresponding
 * type was selected. It will render a line, area, bar or sparkline chart. Within this component we are loading the
 * metrics for the queries and pass the data to the `PrometheusChart` or `PrometheusSparkline` components to render the
 * actual chart (and legend).
 */
const ChartPanel: FunctionComponent<IPluginPanelProps<IOptions>> = ({
  title,
  description,
  instance,
  options,
  times,
  setTimes,
}) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const links = useMemo(() => {
    const queryParams =
      options?.queries?.map((query) => `&queries[]=${encodeURIComponent(query.query ?? '')}`) ?? undefined;

    return {
      link: `${pluginBasePath(instance)}?time=${times.time}&timeEnd=${times.timeEnd}&timeStart=${times.timeStart}${
        queryParams && queryParams.length > 0 ? queryParams.join('') : ''
      }`,
      title: 'Explore',
    };
  }, [instance, times, options?.queries]);

  /**
   * Here we are loading the metrics based on the user provided options. After we get the metrics, we have to set /
   * convert some fields in the returned data. This means we have to set a color, we have to convert the x value to a
   * `Date` object and we have to set the custom properties, so we can use them in the tooltip.
   */
  const { isError, isFetching, isLoading, error, data, refetch } = useQuery<IMetrics, APIError>(
    ['prometheus/range', instance, options, times],
    async () => {
      const result = await apiContext.client.post<IMetrics>('/api/plugins/prometheus/range', {
        body: {
          queries: options?.queries?.map((query) => {
            return { label: query.label, query: query.query };
          }),
          timeEnd: times.timeEnd,
          timeStart: times.timeStart,
        },
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });

      if (result.metrics) {
        for (let i = 0; i < result.metrics.length; i++) {
          const color = getChartColor(i);
          result.metrics[i].color = color;

          for (let j = 0; j < result.metrics[i].data.length; j++) {
            result.metrics[i].data[j] = {
              color: color,
              name: result.metrics[i].name,
              x: new Date(result.metrics[i].data[j].x),
              y: result.metrics[i].data[j].y,
            };
          }
        }
        return result;
      } else {
        return result;
      }
    },
    { keepPreviousData: true },
  );

  return (
    <PluginPanel
      title={title}
      description={description}
      actions={<PluginPanelActionLinks isFetching={isFetching} links={[links]} />}
    >
      <UseQueryWrapper
        error={error}
        errorTitle="Failed to load metrics"
        isError={isError}
        isLoading={isLoading}
        isNoData={!data || !data.metrics || data.metrics.length === 0}
        noDataTitle="No metrics were found"
        noDataMessage={`No metrics were found for your provided ${
          options?.queries?.length === 1 ? 'query' : 'queries'
        }.`}
        refetch={refetch}
      >
        {data && (options?.type === 'line' || options?.type === 'area' || options?.type === 'bar') ? (
          <PrometheusChart
            metrics={data}
            type={options.type}
            unit={options.unit}
            legend={options.legend}
            stacked={options.stacked ?? false}
            yAxisMin={options.yAxis?.min}
            yAxisMax={options.yAxis?.max}
            times={times}
            setTimes={setTimes}
          />
        ) : data && data.metrics && options?.type === 'sparkline' ? (
          <PrometheusSparkline
            queries={options.queries ?? []}
            metrics={data.metrics}
            unit={options.unit}
            mappings={options.mappings}
            value={options.sparkline}
            times={times}
          />
        ) : null}
      </UseQueryWrapper>
    </PluginPanel>
  );
};

/**
 * The `TablePanel` component is used to render a table with the user provided queries, when the corresponding `table`
 * type was specified by a user.
 */
const TablePanel: FunctionComponent<IPluginPanelProps<IOptions>> = ({
  title,
  description,
  instance,
  options,
  times,
}) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const links = useMemo(() => {
    const queryParams =
      options?.queries?.map((query) => `&queries[]=${encodeURIComponent(query.query ?? '')}`) ?? undefined;

    return {
      link: `${pluginBasePath(instance)}?time=${times.time}&timeEnd=${times.timeEnd}&timeStart=${times.timeStart}${
        queryParams && queryParams.length > 0 ? queryParams.join('') : ''
      }`,
      title: 'Explore',
    };
  }, [instance, times, options?.queries]);

  const { isError, isFetching, isLoading, error, data, refetch } = useQuery<
    Record<string, Record<string, string>>,
    APIError
  >(
    ['prometheus/range', instance, options, times],
    async () => {
      return apiContext.client.post<Record<string, Record<string, string>>>(`/api/plugins/prometheus/instant`, {
        body: {
          queries: options?.queries,
          resolution: '',
          timeEnd: times.timeEnd,
          timeStart: times.timeStart,
        },
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
    },
    { keepPreviousData: true },
  );

  return (
    <PluginPanel
      title={title}
      description={description}
      actions={<PluginPanelActionLinks isFetching={isFetching} links={[links]} />}
    >
      <UseQueryWrapper
        error={error}
        errorTitle="Failed to load metrics"
        isError={isError}
        isLoading={isLoading}
        isNoData={!data || Object.keys(data).length === 0}
        noDataTitle="No metrics were found"
        noDataMessage={`No metrics were found for your provided ${
          options?.queries?.length === 1 ? 'query' : 'queries'
        }.`}
        refetch={refetch}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {options?.columns?.map((column) => (
                  <TableCell key={column.name}>{column.title ? column.title : column.name}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(data ?? {}).map((key) => (
                <TableRow
                  key={key}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                  hover={true}
                >
                  {options?.columns?.map((column, index) => (
                    <TableCell key={column.name}>
                      {formatCellValue(key, column, data)}
                      {column.unit ? ` ${column.unit}` : ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </UseQueryWrapper>
    </PluginPanel>
  );
};

/**
 * The `PrometheusPanel` component is used as panel in a dashboard, when a user selected the `prometheus` type in the
 * panel. The panel is used to validate the provided user provided `options`. If they are invalid, we render an error
 * message. If the options are valid we render the chart or the table panel depending on the provided `type` in the
 * options.
 */
const PrometheusPanel: FunctionComponent<IPluginPanelProps<IOptions>> = ({
  title,
  description,
  instance,
  options,
  times,
  setTimes,
}) => {
  if (
    !options ||
    !options.type ||
    !options.queries ||
    !Array.isArray(options.queries) ||
    options.queries.length === 0
  ) {
    return (
      <PluginPanelError
        title={title}
        description={description}
        message="Invalid options for Prometheus plugin"
        details="One of the required options: 'type' or 'queries' is missing"
        example={`plugin:
  name: prometheus
  type: prometheus
  options:
    type: line
    queries:
      - label: "{% .instance %}"
        query: sum(node_load1) by (instance)`}
        documentation="https://kobs.io/main/plugins/prometheus"
      />
    );
  }

  if (options.type === 'table') {
    return (
      <TablePanel
        title={title}
        description={description}
        instance={instance}
        options={options}
        times={times}
        setTimes={setTimes}
      />
    );
  }

  return (
    <ChartPanel
      title={title}
      description={description}
      instance={instance}
      options={options}
      times={times}
      setTimes={setTimes}
    />
  );
};

export default PrometheusPanel;
