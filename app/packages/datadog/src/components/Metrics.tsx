import {
  APIContext,
  APIError,
  ChartTooltip,
  GridContext,
  IAPIContext,
  IGridContext,
  IPluginInstance,
  ITimes,
  PluginPanel,
  UseQueryWrapper,
  chartTheme,
  chartTickFormatTime,
  chartTickFormatValue,
  formatTime,
  getChartColor,
  roundNumber,
  useDimensions,
} from '@kobsio/core';
import { Square } from '@mui/icons-material';
import { Box, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, useRef } from 'react';
import {
  createContainer,
  VictoryArea,
  VictoryChart,
  VictoryAxis,
  VictoryGroup,
  VictoryVoronoiContainerProps,
  VictoryBrushContainerProps,
} from 'victory';

/**
 * `IMetricsQueryResponse` is the interface for the data returned from a metrics request.
 */
export interface IMetricsQueryResponse {
  error?: string;
  from_date?: number;
  group_by?: string[];
  message?: string;
  query?: string;
  res_type?: string;
  series?: IMetricsQueryMetadata[];
  status?: string;
  to_date?: number;
}

export interface IMetricsQueryMetadata {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  aggr?: any;
  display_name?: string;
  end?: number;
  expression?: string;
  interval?: number;
  length?: number;
  metric?: string;
  pointlist?: (number | undefined)[][];
  query_index?: number;
  scope?: string;
  start?: number;
  tag_set?: string[];
  unit?: IMetricsQueryUnit[];
}

export interface IMetricsQueryUnit {
  family?: string;
  name?: string;
  plural?: string;
  scale_factor?: number;
  short_name?: string;
}

const convertMetrics = (
  metrics: IMetricsQueryMetadata[],
): {
  avg: number;
  color: string;
  current: number | null;
  data: { color: string; name: string; unit: string; x: Date; y: number | null }[];
  max: number;
  min: number;
  name: string;
  unit: string;
}[] => {
  const series: {
    avg: number;
    color: string;
    current: number | null;
    data: { color: string; name: string; unit: string; x: Date; y: number | null }[];
    max: number;
    min: number;
    name: string;
    unit: string;
  }[] = [];

  for (let i = 0; i < metrics.length; i++) {
    const name = metrics[i].scope ?? metrics[i].display_name ?? metrics[i].metric ?? '';
    const unit = '';
    const color = getChartColor(i);
    const data: { color: string; name: string; unit: string; x: Date; y: number | null }[] = [];

    let min = 0;
    let max = 0;
    let sum = 0;

    if (metrics[i].pointlist) {
      const pointlist = metrics[i].pointlist as (number | undefined)[][];

      for (let j = 0; j < pointlist.length; j++) {
        const x = pointlist[j][0];
        const y = pointlist[j][1];

        if (x !== undefined) {
          if (y !== undefined) {
            if (j === 0) {
              min = y;
              max = y;
            } else {
              if (y < min) {
                min = y;
              }
              if (y > max) {
                max = y;
              }
              sum = sum + y;
            }
          }

          data.push({
            color: color,
            name: name,
            unit: unit,
            x: new Date(x),
            y: y ?? null,
          });
        }
      }
    }

    series.push({
      avg: sum / data.length,
      color: color,
      current: data[data.length - 1].y ?? null,
      data: data,
      max: max,
      min: min,
      name: name,
      unit: unit,
    });
  }

  return series;
};

const MetricsChart: FunctionComponent<{
  metrics: IMetricsQueryMetadata[];
  setTimes: (times: ITimes) => void;
  times: ITimes;
}> = ({ metrics, times, setTimes }) => {
  const theme = useTheme();
  const gridContext = useContext<IGridContext>(GridContext);
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  const data = convertMetrics(metrics);

  /**
   * The `BrushVoronoiContainer` component is used as container for the charts. It allows us to render a tooltip for the
   * metrics and to select a new time range via the brush function of the Victory charts package.
   */
  const BrushVoronoiContainer = createContainer<VictoryVoronoiContainerProps, VictoryBrushContainerProps>(
    'voronoi',
    'brush',
  );

  return (
    <Box height={gridContext.autoHeight ? '500px' : '100%'}>
      <Box
        sx={{ height: gridContext.autoHeight ? `${500 - 80}px` : 'calc(100% - 80px)', width: '100%' }}
        ref={refChart}
        data-testid="datadog-metrics-chart"
      >
        <VictoryChart
          theme={chartTheme(theme)}
          containerComponent={
            <BrushVoronoiContainer
              brushDimension="x"
              labels={() => ' '}
              labelComponent={
                <ChartTooltip
                  height={chartSize.height}
                  width={chartSize.width}
                  legendData={({
                    datum,
                  }: {
                    datum: { color: string; name: string; unit: string; x: Date; y: number };
                  }) => ({
                    color: datum.color,
                    label: datum.name,
                    title: formatTime(datum.x as Date),
                    unit: datum.unit,
                    value: datum.y !== null ? roundNumber(datum.y, 4) : 'N/A',
                  })}
                />
              }
              mouseFollowTooltips={true}
              defaultBrushArea="none"
              brushDomain={{ x: [0, 0] }}
              onBrushDomainChangeEnd={(domain) => {
                if (domain.x.length === 2) {
                  setTimes({
                    time: 'custom',
                    timeEnd: Math.floor((domain.x[1] as Date).getTime() / 1000),
                    timeStart: Math.floor((domain.x[0] as Date).getTime() / 1000),
                  });
                }
              }}
            />
          }
          height={chartSize.height}
          padding={{ bottom: 25, left: 55, right: 0, top: 0 }}
          scale={{ x: 'time', y: 'linear' }}
          width={chartSize.width}
        >
          <VictoryAxis dependentAxis={false} tickFormat={chartTickFormatTime} />
          <VictoryAxis dependentAxis={true} tickFormat={chartTickFormatValue} />

          <VictoryGroup>
            {data.map((metric) => (
              <VictoryArea
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
      <Box
        height={80}
        sx={{
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          overflowY: 'auto',
        }}
      >
        <TableContainer>
          <Table size="small" padding="none">
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell>Min</TableCell>
                <TableCell>Max</TableCell>
                <TableCell>Avg</TableCell>
                <TableCell>Current</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((datum) => (
                <TableRow key={datum.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Stack direction="row" spacing={4} alignItems="center">
                      <Square sx={{ color: datum.color }} />
                      <Box>{datum.name}</Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {roundNumber(datum.min, 4)} {datum.unit}
                  </TableCell>
                  <TableCell>
                    {roundNumber(datum.max, 4)} {datum.unit}
                  </TableCell>
                  <TableCell>
                    {roundNumber(datum.avg, 4)} {datum.unit}
                  </TableCell>
                  <TableCell>
                    {datum.current !== null ? roundNumber(datum.current, 4) : 'N/A'}
                    {datum.current !== null ? ` ${datum.unit}` : ''}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export const Metrics: FunctionComponent<{
  description?: string;
  instance: IPluginInstance;
  query: string;
  setTimes: (times: ITimes) => void;
  times: ITimes;
  title: string;
}> = ({ instance, title, description, query, times, setTimes }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IMetricsQueryMetadata[], APIError>(
    ['datadog/metrics', instance, query, times],
    async () => {
      const resp = await apiContext.client.get<IMetricsQueryResponse>(
        `/api/plugins/datadog/metrics?query=${encodeURIComponent(query)}&timeStart=${times.timeStart}&timeEnd=${
          times.timeEnd
        }`,
        {
          headers: {
            'x-kobs-cluster': instance.cluster,
            'x-kobs-plugin': instance.name,
          },
        },
      );

      if (resp.error) {
        throw new Error(resp.error);
      }

      return resp.series ?? [];
    },
  );

  console.log(data);

  return (
    <PluginPanel title={title} description={description}>
      <UseQueryWrapper
        error={error}
        errorTitle="Failed to load metrics"
        isError={isError}
        isLoading={isLoading}
        isNoData={!data || data.length === 0}
        noDataTitle="No metrics were found"
        refetch={refetch}
      >
        {data && <MetricsChart metrics={data} times={times} setTimes={setTimes} />}
      </UseQueryWrapper>
    </PluginPanel>
  );
};
