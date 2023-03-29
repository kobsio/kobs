import {
  ITimes,
  useDimensions,
  chartTickFormatTime,
  chartTickFormatValue,
  chartTheme,
  formatTime,
  roundNumber,
} from '@kobsio/core';
import { Square } from '@mui/icons-material';
import { Box, darken, useTheme } from '@mui/material';
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
  VictoryTooltip,
  FlyoutProps,
} from 'victory';

import { IDatum, IMetric } from '../utils/utils';

/**
 * The `ChartTooltip` component is used to render our tooltips for a metric. It uses `foreignObject` so that we can
 * render HTML in the SVG charts. The tooltip position is calculated based on the x and y position and based on the
 * value.
 *
 * The tooltip contains the time for the datapoint, the color and label as well as the value with the unit. Since we
 * only have access to the `FlyoutProps` and a single datapoint (`IDatum`). This datapoint must contain all these
 * information.
 */
const ChartTooltip = (props: FlyoutProps) => {
  const datum = props.datum as IDatum;
  const xValue = Math.floor((datum.x as Date).getTime() / 1000);
  const yValue = datum.y;
  const x = props.x ?? 0;
  const y = props.y ?? 0;

  return (
    <g style={{ pointerEvents: 'none' }}>
      <foreignObject
        x={xValue > (datum.customMaxX + datum.customMinX) / 2 ? x - 300 : x}
        y={y > 250 ? y - 75 : y}
        width="300"
        height="100"
      >
        <Box sx={{ backgroundColor: darken('#233044', 0.13), p: 4 }}>
          <b>{formatTime(datum.x as Date)}</b>
          <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: 2 }}>
            <Square sx={{ color: datum.customColor }} />
            <Box
              component="span"
              sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {datum.customLabel}
            </Box>
            <Box component="span" sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {roundNumber(yValue, 4)} {(props as any).text}
            </Box>
          </Box>
        </Box>
      </foreignObject>
    </g>
  );
};

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
        key={metrics[index].id}
        data={metric.data}
        name={metrics[index].label}
        colorScale={[metrics[index].color]}
        interpolation="monotoneX"
      />
    ) : type === 'bar' ? (
      <VictoryBar
        key={metrics[index].id}
        data={metric.data}
        name={metrics[index].label}
        colorScale={[metrics[index].color]}
      />
    ) : (
      <VictoryLine
        key={metrics[index].id}
        data={metric.data}
        name={metrics[index].label}
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
            labels={() => unit || ' '}
            labelComponent={<VictoryTooltip labelComponent={<ChartTooltip />} />}
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
        <VictoryAxis dependentAxis={true} label={unit} tickFormat={(tick: number) => chartTickFormatValue(tick)} />

        {stacked ? <VictoryStack>{chartData}</VictoryStack> : <VictoryGroup>{chartData}</VictoryGroup>}
      </VictoryChart>
    </Box>
  );
};

export default Chart;
