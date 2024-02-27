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
import { createContainer, VictoryArea, VictoryChart, VictoryAxis, VictoryGroup } from 'victory';

interface IMetric {
  id: string;
  name: IMetricName;
  timeseries: IMetricTimeseries[];
  type: string;
  unit: string;
}

interface IMetricName {
  localizedValue: string;
  value: string;
}

interface IMetricTimeseries {
  data: IMetricDatum[];
}

interface IMetricDatum {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  timeStamp: string;
}

const convertMetrics = (
  metrics: IMetric[],
  aggregationType: string,
): {
  avg: number;
  color: string;
  current: number;
  data: { color: string; name: string; unit: string; x: Date; y: number }[];
  max: number;
  min: number;
  name: string;
  unit: string;
}[] => {
  const series: {
    avg: number;
    color: string;
    current: number;
    data: { color: string; name: string; unit: string; x: Date; y: number }[];
    max: number;
    min: number;
    name: string;
    unit: string;
  }[] = [];
  let index = 0;

  for (let i = 0; i < metrics.length; i++) {
    for (let j = 0; j < metrics[i].timeseries.length; j++) {
      const data = [];
      const color = getChartColor(index);
      index = index + 1;

      let min = 0;
      let max = 0;
      let sum = 0;

      for (let k = 0; k < metrics[i].timeseries[j].data.length; k++) {
        const datum = metrics[i].timeseries[j].data[k];
        const y = datum[aggregationType.toLowerCase()] === undefined ? null : datum[aggregationType.toLowerCase()];

        if (k === 0) {
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

        data.push({
          color: color,
          name: metrics[i].name.localizedValue,
          unit: metrics[i].unit,
          x: new Date(datum.timeStamp),
          y: y,
        });
      }

      series.push({
        avg: sum / data.length,
        color: color,
        current: data[data.length - 1].y,
        data: data,
        max: max,
        min: min,
        name: metrics[i].name.localizedValue,
        unit: metrics[i].unit,
      });
    }
  }

  return series;
};

const MetricsChart: FunctionComponent<{
  aggregationType: string;
  metrics: IMetric[];
  setTimes: (times: ITimes) => void;
  times: ITimes;
}> = ({ metrics, aggregationType, times, setTimes }) => {
  const theme = useTheme();
  const gridContext = useContext<IGridContext>(GridContext);
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  const data = convertMetrics(metrics, aggregationType);

  /**
   * The `BrushVoronoiContainer` component is used as container for the charts. It allows us to render a tooltip for the
   * metrics and to select a new time range via the brush function of the Victory charts package.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const BrushVoronoiContainer: any = createContainer('voronoi', 'brush');

  return (
    <Box height={gridContext.autoHeight ? '500px' : '100%'}>
      <Box
        sx={{ height: gridContext.autoHeight ? `${500 - 80}px` : 'calc(100% - 80px)', width: '100%' }}
        ref={refChart}
        data-testid="azure-metrics-chart"
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
                    value: datum.y ? roundNumber(datum.y, 4) : 'N/A',
                  })}
                />
              }
              mouseFollowTooltips={true}
              defaultBrushArea="none"
              brushDomain={{ x: [0, 0] }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onBrushDomainChangeEnd={(domain: any) => {
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
                    {roundNumber(datum.current, 4)} {datum.unit}
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
  aggregationType: string;
  description?: string;
  instance: IPluginInstance;
  interval: string;
  metric: string;
  provider: string;
  resourceGroup: string;
  setTimes: (times: ITimes) => void;
  times: ITimes;
  title: string;
}> = ({
  instance,
  title,
  description,
  resourceGroup,
  metric,
  provider,
  aggregationType,
  interval,
  times,
  setTimes,
}) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IMetric[], APIError>(
    ['azure/monitor/metrics', instance, resourceGroup, metric, provider, aggregationType, interval, times],
    async () => {
      return apiContext.client.get<IMetric[]>(
        `/api/plugins/azure/monitor/metrics?resourceGroup=${resourceGroup}&provider=${provider}&metric=${metric}&aggregationType=${aggregationType}&interval=${interval}&timeStart=${times.timeStart}&timeEnd=${times.timeEnd}`,
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
        {data && <MetricsChart metrics={data} aggregationType={aggregationType} times={times} setTimes={setTimes} />}
      </UseQueryWrapper>
    </PluginPanel>
  );
};
