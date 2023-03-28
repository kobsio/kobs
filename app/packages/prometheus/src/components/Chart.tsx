import {
  ITimes,
  useDimensions,
  chartTickFormatTime,
  chartTickFormatValue,
  chartTheme,
  formatTime,
  roundNumber,
  ChartTooltip,
} from '@kobsio/core';
import { Box, useTheme } from '@mui/material';
import { FunctionComponent, useRef } from 'react';
import {
  createContainer,
  VictoryArea,
  VictoryBar,
  VictoryLine,
  VictoryChart,
  VictoryAxis,
  VictoryGroup,
  VictoryStack,
  VictoryVoronoiContainerProps,
  VictoryBrushContainerProps,
} from 'victory';

import { IDatum, IMetric } from '../utils/utils';

/**
 * `IChartProps` is the interface for the properties of the `Chart` component.
 */
interface IChartProps {
  max?: number;
  metrics: IMetric[];
  min?: number;
  setTimes: (times: ITimes) => void;
  stacked: boolean;
  times: ITimes;
  type: 'line' | 'area' | 'bar';
  unit?: string;
}

/**
 * The `Chart` component is used to render a line, area or bar chart for the provided `metrics`. The chart type is
 * specified via the `type` property. A user can also stack the metrics by setting the `stacked` property. The `min`,
 * `max` and `times` are required, to set the domain of the chart.
 *
 * The chart can also be used to adjust the currently selected `times`, by selecting a time range in the chart, which
 * will then execute the provided `setTimes` function.
 */
const Chart: FunctionComponent<IChartProps> = ({ metrics, type, stacked, unit, min, max, times, setTimes }) => {
  const theme = useTheme();
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  /**
   * Depending on the provided `type` we have to use different components for the chart. This is handled in the
   * following.
   */
  const chartData = metrics.map((metric, index) =>
    type === 'area' ? (
      <VictoryArea
        key={metrics[index].name}
        data={metric.data}
        name={metrics[index].name}
        colorScale={[metrics[index].color]}
        interpolation="monotoneX"
      />
    ) : type === 'bar' ? (
      <VictoryBar
        key={metrics[index].name}
        data={metric.data}
        name={metrics[index].name}
        colorScale={[metrics[index].color]}
      />
    ) : (
      <VictoryLine
        key={metrics[index].name}
        data={metric.data}
        name={metrics[index].name}
        colorScale={[metrics[index].color]}
        interpolation="monotoneX"
      />
    ),
  );

  /**
   * The `BrushVoronoiContainer` component is used as container for the charts. It allows us to render a tooltip for the
   * metrics and to select a new time range via the brush function of the Victory charts package.
   */
  const BrushVoronoiContainer = createContainer<VictoryVoronoiContainerProps, VictoryBrushContainerProps>(
    'voronoi',
    'brush',
  );

  return (
    <Box height="100%" width="100%" ref={refChart}>
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
                legendData={({ datum }: { datum: IDatum }) => ({
                  color: datum.color,
                  label: datum.name,
                  title: formatTime(datum.x as Date),
                  unit: unit,
                  value: datum.y ? roundNumber(datum.y, 4) : 'N/A',
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
        padding={{ bottom: 25, left: unit ? 60 : 55, right: 0, top: 0 }}
        scale={{ x: 'time', y: 'linear' }}
        width={chartSize.width}
        domain={{ x: [new Date(times.timeStart * 1000), new Date(times.timeEnd * 1000)] }}
        // maxDomain={{ y: stacked ? undefined : max }}
        // minDomain={{ y: stacked ? undefined : min }}
      >
        <VictoryAxis dependentAxis={false} tickFormat={chartTickFormatTime} />
        <VictoryAxis dependentAxis={true} label={unit} tickFormat={chartTickFormatValue} />

        {stacked ? <VictoryStack>{chartData}</VictoryStack> : <VictoryGroup>{chartData}</VictoryGroup>}
      </VictoryChart>
    </Box>
  );
};

export default Chart;
