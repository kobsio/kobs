import { useDimensions, chartTheme, ChartTooltip, formatTime, roundNumber, chartColors } from '@kobsio/core';
import { Square } from '@mui/icons-material';
import { Box, darken, useTheme } from '@mui/material';
import React, { FunctionComponent, useRef } from 'react';
import {
  createContainer,
  FlyoutProps,
  VictoryArea,
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryCursorContainerProps,
  VictoryGroup,
  VictoryLine,
  VictoryTooltip,
  VictoryVoronoiContainerProps,
} from 'victory';

import { IAggregationData, ISeries, ISeriesDatum } from './AggregationTypes';

import { chartFormatLabel, convertToTimeseriesChartData } from '../utils/aggregation';

const CursorVoronoiContainer = createContainer<VictoryCursorContainerProps, VictoryVoronoiContainerProps>(
  'voronoi',
  'cursor',
);

interface IChartTooltipContentProps extends FlyoutProps {
  activePoints: [{ childName: string }];
  colorMap: Map<string, string>;
  datum: ISeriesDatum;
}

/**
 * ChartTooltipContent renders a timestamp a color-indicator and the metric name,
 * when the user hovers over a datapoint inside the chart area
 */
const ChartTooltipContent: FunctionComponent<IChartTooltipContentProps> = (props) => {
  return (
    <Box sx={{ backgroundColor: darken('#233044', 0.13), p: 4 }}>
      <b>{formatTime(props.datum.x)}</b>
      <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: 2 }}>
        <Square sx={{ color: props.colorMap.get(props.activePoints[0].childName) }} />
        <Box component="span" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {props.activePoints[0].childName}
        </Box>
        <Box component="span" sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
          {roundNumber(props.datum.y ?? 0, 4)}
        </Box>
      </Box>
    </Box>
  );
};

/**
 * makeColormap creates a Map<string,string> which maps the label to a color value
 * this map is useful for displaying a colored item in the Tooltip content
 */
const makeColormap = (series: ISeries[]): Map<string, string> => {
  const m = new Map<string, string>();
  series.forEach((s, i) => {
    m.set(s.name, chartColors[i]);
  });
  return m;
};

interface IAggregationChartTimeseriesProps {
  data: IAggregationData;
  filters: string[];
  type: 'line' | 'area' | 'bar';
}

const AggregationChartTimeseries: React.FunctionComponent<IAggregationChartTimeseriesProps> = ({
  data,
  type,
  filters,
}: IAggregationChartTimeseriesProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);
  const muiTheme = useTheme();
  const theme = chartTheme(muiTheme);
  const series = convertToTimeseriesChartData(data, filters);
  const numBars = Math.max(...series.map((s) => s.data.length));
  const barWidth = chartSize.width / numBars - 8;
  const colorMap = makeColormap(series);
  const chartData = series.map((s) =>
    type === 'area' ? (
      <VictoryArea key={s.name} data={s.data} name={s.name} interpolation="monotoneX" />
    ) : type === 'bar' ? (
      <VictoryBar key={s.name} data={s.data} name={s.name} barWidth={barWidth} />
    ) : (
      <VictoryLine key={s.name} data={s.data} name={s.name} interpolation="monotoneX" />
    ),
  );

  return (
    <Box style={{ height: '100%', width: '100%' }} ref={refChart}>
      <VictoryChart
        containerComponent={
          <CursorVoronoiContainer
            labelComponent={
              <VictoryTooltip
                labelComponent={
                  <ChartTooltip
                    width={chartSize.width}
                    component={(props) => (
                      <ChartTooltipContent {...(props as IChartTooltipContentProps)} colorMap={colorMap} />
                    )}
                  />
                }
              />
            }
            mouseFollowTooltips={true}
            labels={({ datum }: { datum: ISeriesDatum }): string => chartFormatLabel(datum.y ? `${datum.y}` : '')}
          />
        }
        height={chartSize.height}
        padding={{ bottom: 30, left: 50, right: 0, top: 35 }}
        domainPadding={{ x: [20, 20], y: [0, 30] }}
        scale={{ x: 'time', y: 'linear' }}
        theme={theme}
        width={chartSize.width}
      >
        <VictoryAxis dependentAxis={false} />
        <VictoryAxis dependentAxis={true} />

        <VictoryGroup>{chartData}</VictoryGroup>
      </VictoryChart>
    </Box>
  );
};

export default AggregationChartTimeseries;
