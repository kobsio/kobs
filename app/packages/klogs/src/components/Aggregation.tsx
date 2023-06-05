import {
  APIContext,
  APIError,
  ChartTooltip,
  GridContext,
  IAPIContext,
  IGridContext,
  IPluginInstance,
  ITimes,
  UseQueryWrapper,
  chartColors,
  chartTheme,
  chartTickFormatTime,
  chartTickFormatValue,
  formatTime,
  roundNumber,
  useDimensions,
} from '@kobsio/core';
import { Box, darken, useTheme } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, useRef } from 'react';
import {
  VictoryArea,
  VictoryAxis,
  VictoryBar,
  VictoryBrushContainerProps,
  VictoryChart,
  VictoryGroup,
  VictoryLine,
  VictoryPie,
  VictoryTooltip,
  VictoryVoronoiContainerProps,
  createContainer,
} from 'victory';

import {
  IAggregationData,
  IAggregationOptions,
  ISeriesDatum,
  convertToBarChartTopData,
  convertToTimeseriesChartData,
} from '../utils/aggregation';

const AggregationPieChart: FunctionComponent<{ data: IAggregationData }> = ({ data }) => {
  const theme = useTheme();
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  if (data.columns.length !== 2) {
    return null;
  }

  const total = data.rows.reduce((total, row) => total + (row[data.columns[1]] as number), 0);
  const pieData = data.rows.map((row) => {
    const y = row[data.columns[1]] as number;
    const percentage = Math.round((y / total) * 100);
    return {
      x: `${row[data.columns[0]]}: ${y} (${percentage}%)`,
      y: y,
    };
  });

  return (
    <Box sx={{ height: '100%', width: '100%' }} ref={refChart} data-testid="klogs-pie-chart">
      <VictoryPie
        data={pieData}
        height={chartSize.height}
        width={chartSize.width}
        colorScale={chartColors}
        labelComponent={
          <VictoryTooltip
            flyoutStyle={{
              fill: darken(theme.palette.background.paper, 0.13),
              strokeWidth: 0,
            }}
            style={{
              fill: theme.palette.text.primary,
            }}
            cornerRadius={0}
            flyoutPadding={{ bottom: 8, left: 20, right: 20, top: 8 }}
          />
        }
      />
    </Box>
  );
};

const AggregationBarTopChart: FunctionComponent<{
  data: IAggregationData;
  filters: string[];
}> = ({ data, filters }) => {
  const theme = useTheme();
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);
  const barData = convertToBarChartTopData(data, filters);

  return (
    <Box style={{ height: '100%', width: '100%' }} ref={refChart} data-testid="klogs-top-chart">
      <VictoryChart
        height={chartSize.height}
        padding={{ bottom: 0, left: 55, right: 0, top: 0 }}
        domainPadding={{ x: [50, 50], y: [0, 100] }}
        theme={chartTheme(theme)}
        width={chartSize.width}
      >
        <VictoryAxis dependentAxis={false} tickFormat={() => ''} />
        <VictoryAxis dependentAxis={true} tickFormat={chartTickFormatValue} />

        <VictoryGroup>
          {barData.metrics.map((metric) => (
            <VictoryBar
              labelComponent={
                <VictoryTooltip
                  labelComponent={
                    <ChartTooltip
                      height={chartSize.height}
                      width={chartSize.width}
                      legendData={({ datum }: { datum: { xName: string; y: number } }) => ({
                        color: chartColors[0],
                        label: datum.xName,
                        unit: '',
                        value: datum.y ? roundNumber(datum.y, 4) : 'N/A',
                      })}
                    />
                  }
                />
              }
              key={metric[0].name}
              name={metric[0].name}
              data={metric}
            />
          ))}
        </VictoryGroup>
      </VictoryChart>
    </Box>
  );
};

const AggregationChartTimeseries: FunctionComponent<{
  data: IAggregationData;
  filters: string[];
  setTimes: (times: ITimes) => void;
  type: string;
}> = ({ data, type, filters, setTimes }) => {
  const theme = useTheme();
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  const series = convertToTimeseriesChartData(data, filters);
  const numBars = Math.max(...series.map((s) => s.data.length));
  const barWidth = chartSize.width / numBars - 8;
  const chartData = series.map((s) =>
    type === 'area' ? (
      <VictoryArea key={s.name} data={s.data} name={s.name} interpolation="monotoneX" />
    ) : type === 'bar' ? (
      <VictoryBar key={s.name} data={s.data} name={s.name} barWidth={barWidth} />
    ) : (
      <VictoryLine key={s.name} data={s.data} name={s.name} interpolation="monotoneX" />
    ),
  );

  const BrushVoronoiContainer = createContainer<VictoryVoronoiContainerProps, VictoryBrushContainerProps>(
    'voronoi',
    'brush',
  );

  return (
    <Box style={{ height: '100%', width: '100%' }} ref={refChart} data-testid="klogs-timeseries-chart">
      <VictoryChart
        containerComponent={
          <BrushVoronoiContainer
            brushDimension="x"
            labels={() => ' '}
            labelComponent={
              <VictoryTooltip
                labelComponent={
                  <ChartTooltip
                    height={chartSize.height}
                    width={chartSize.width}
                    legendData={({ datum }: { datum: ISeriesDatum }) => ({
                      color: datum.color,
                      label: datum.series || 'count',
                      title: formatTime(datum.x as Date),
                      unit: '',
                      value: datum.y ? roundNumber(datum.y, 4) : 0,
                    })}
                  />
                }
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
        theme={chartTheme(theme)}
        width={chartSize.width}
      >
        <VictoryAxis dependentAxis={false} tickFormat={chartTickFormatTime} />
        <VictoryAxis dependentAxis={true} tickFormat={chartTickFormatValue} />

        <VictoryGroup>{chartData}</VictoryGroup>
      </VictoryChart>
    </Box>
  );
};

const AggregationChart: FunctionComponent<{
  data: IAggregationData;
  options: IAggregationOptions;
  setTimes: (times: ITimes) => void;
}> = ({ data, options, setTimes }) => {
  const gridContext = useContext<IGridContext>(GridContext);

  return (
    <Box height={gridContext.autoHeight ? '500px' : '100%'}>
      {options.chart === 'pie' ? (
        <AggregationPieChart data={data} />
      ) : options.chart === 'bar' && options.horizontalAxisOperation === 'top' ? (
        <AggregationBarTopChart data={data} filters={options.breakDownByFilters} />
      ) : (options.chart === 'bar' || options.chart === 'area' || options.chart === 'line') &&
        options.horizontalAxisOperation === 'time' ? (
        <AggregationChartTimeseries
          data={data}
          filters={options.breakDownByFilters}
          type={options.chart}
          setTimes={setTimes}
        />
      ) : null}
    </Box>
  );
};

export const Aggregation: FunctionComponent<{
  instance: IPluginInstance;
  options: IAggregationOptions;
  setTimes: (times: ITimes) => void;
}> = ({ instance, options, setTimes }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IAggregationData, APIError>(
    ['klogs/aggregation', options],
    () => {
      if (options.chart === 'pie') {
        if (!options.sliceBy) {
          throw new Error('"Slice by" is required');
        }
      } else if (options.chart === 'bar' && options.horizontalAxisOperation === 'top') {
        if (!options.horizontalAxisField) {
          throw new Error('"Horizontal axis field" is required');
        }
        if (!options.horizontalAxisLimit || Number.isNaN(Number(options.horizontalAxisLimit))) {
          throw new Error('"Horizontal axis limit" is required and must be a number');
        }
      } else {
        if (!options.horizontalAxisOperation) {
          throw new Error('"Horizontal axis operation" is required');
        }
        if (options.verticalAxisOperation !== 'count' && !options.verticalAxisField) {
          throw new Error(`"Vertical axis field" is required`);
        }
      }

      return apiContext.client.post<IAggregationData>('/api/plugins/klogs/aggregation', {
        body: {
          chart: options.chart,
          options: options,
          query: options.query,
          times: {
            timeEnd: options.timeEnd,
            timeStart: options.timeStart,
          },
        },
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      isError={isError}
      isLoading={isLoading}
      refetch={refetch}
      errorTitle="Failed to get aggregation data"
      isNoData={!data || !data.rows || data.rows.length === 0}
      noDataTitle="No aggregation data was found"
      noDataMessage="No aggregation data was found for the provided query in the provided time range."
    >
      {data && <AggregationChart data={data} options={options} setTimes={setTimes} />}
    </UseQueryWrapper>
  );
};
