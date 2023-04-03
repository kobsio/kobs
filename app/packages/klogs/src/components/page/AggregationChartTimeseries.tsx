import { useDimensions, chartTheme, ChartTooltip, formatTime, roundNumber } from '@kobsio/core';
import { Box, useTheme } from '@mui/material';
import React, { useRef } from 'react';
import {
  createContainer,
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

import { IAggregationData, ISeriesDatum } from './AggregationTypes';

import { chartFormatLabel, convertToTimeseriesChartData } from '../utils/aggregation';

const CursorVoronoiContainer = createContainer<VictoryCursorContainerProps, VictoryVoronoiContainerProps>(
  'voronoi',
  'cursor',
);

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
