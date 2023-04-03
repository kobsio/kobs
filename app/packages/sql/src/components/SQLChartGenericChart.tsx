import { useDimensions, formatTime, ChartTooltip, roundNumber, chartTickFormatTime, chartTheme } from '@kobsio/core';
import { Box, useTheme } from '@mui/material';
import React, { useRef } from 'react';
import {
  createContainer,
  VictoryArea,
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryGroup,
  VictoryLine,
  VictoryStack,
  VictoryVoronoiContainerProps,
  VictoryCursorContainerProps,
} from 'victory';

import { IDatum, ILegend, IMetrics } from './types';

const CursorVoronoiContainer = createContainer<VictoryVoronoiContainerProps, VictoryCursorContainerProps>(
  'voronoi',
  'cursor',
);

interface ISQLChartGenericChartProps {
  legend?: ILegend;
  metrics: IMetrics[];
  type: 'area' | 'bar' | 'line';
  xAxisType?: string;
  yAxisStacked?: boolean;
  yAxisUnit?: string;
}

const SQLChartGenericChart: React.FunctionComponent<ISQLChartGenericChartProps> = ({
  metrics,
  type,
  xAxisType,
  yAxisUnit,
  yAxisStacked,
  legend,
}: ISQLChartGenericChartProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const muiTheme = useTheme();
  const theme = chartTheme(muiTheme);
  const chartSize = useDimensions(refChart);
  const chartData = metrics.map((metric) => {
    if (type === 'area') {
      return (
        <VictoryArea
          key={metric.name}
          data={metric.data}
          name={legend && legend.hasOwnProperty(metric.name) ? legend[metric.name] : metric.name}
          interpolation="monotoneX"
        />
      );
    }

    if (type === 'bar') {
      return (
        <VictoryBar
          key={metric.name}
          data={metric.data}
          name={legend && legend.hasOwnProperty(metric.name) ? legend[metric.name] : metric.name}
        />
      );
    }

    if (type === 'line') {
      return (
        <VictoryLine
          key={metric.name}
          data={metric.data}
          name={legend && legend.hasOwnProperty(metric.name) ? legend[metric.name] : metric.name}
          interpolation="monotoneX"
        />
      );
    }

    throw new Error(`unsupported type "${type}"`);
  });

  return (
    <Box style={{ height: '100%', width: '100%' }} ref={refChart}>
      <VictoryChart
        containerComponent={
          <CursorVoronoiContainer
            cursorDimension="x"
            labels={() => ' '}
            labelComponent={
              <ChartTooltip
                height={chartSize.height}
                width={chartSize.width}
                legendData={({ datum }: { datum: IDatum }) => ({
                  color: datum.color,
                  label: datum.name,
                  title: xAxisType === 'time' ? formatTime(datum.x as Date) : `${datum.x}`,
                  unit: yAxisUnit,
                  value: datum.y ? roundNumber(datum.y, 4) : 'N/A',
                })}
              />
            }
            mouseFollowTooltips={true}
            voronoiPadding={0}
          />
        }
        height={chartSize.height}
        padding={{ bottom: 30, left: yAxisUnit ? 55 : 50, right: 0, top: 0 }}
        domainPadding={{ x: type === 'bar' ? [20, 20] : [0, 0], y: [0, 30] }}
        scale={{ x: xAxisType === 'time' ? 'time' : 'linear', y: 'linear' }}
        theme={theme}
        width={chartSize.width}
      >
        <VictoryAxis dependentAxis={false} tickFormat={xAxisType === 'time' ? chartTickFormatTime : undefined} />
        <VictoryAxis dependentAxis={true} label={yAxisUnit} />

        {yAxisStacked ? <VictoryStack>{chartData}</VictoryStack> : <VictoryGroup>{chartData}</VictoryGroup>}
      </VictoryChart>
    </Box>
  );
};

export default SQLChartGenericChart;
