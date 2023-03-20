import { ITimes, useDimensions, chartTheme, chartColors } from '@kobsio/core';
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

import ChartTooltip from './AggregationChartTooltip';
import { IAggregationData, ISeries, ISeriesDatum } from './AggregationTypes';

import { chartFormatLabel, convertToTimeseriesChartData } from '../utils/aggregation';

const CursorVoronoiContainer = createContainer<VictoryCursorContainerProps, VictoryVoronoiContainerProps>(
  'voronoi',
  'cursor',
);

// makeColormap creates a map where the a key maps to a color code
// the key is the name of the time-series.
// it allows us to create a consistent legend inside the tooltip
const makeColormap = (series: ISeries[]) => {
  const m = new Map<string, string>();

  series.forEach((s, i) => {
    m.set(s.name, chartColors[i]);
  });
  return m;
};

interface IAggregationChartTimeseriesProps {
  data: IAggregationData;
  filters: string[];
  times: ITimes;
  type: 'line' | 'area' | 'bar';
}

const AggregationChartTimeseries: React.FunctionComponent<IAggregationChartTimeseriesProps> = ({
  data,
  type,
  filters,
  times,
}: IAggregationChartTimeseriesProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);
  const muiTheme = useTheme();
  const theme = chartTheme(muiTheme);
  const series = convertToTimeseriesChartData(data, filters);
  const chartData = series.map((s) =>
    type === 'area' ? (
      <VictoryArea key={s.name} data={s.data} name={s.name} interpolation="monotoneX" />
    ) : type === 'bar' ? (
      <VictoryBar key={s.name} data={s.data} name={s.name} />
    ) : (
      <VictoryLine key={s.name} data={s.data} name={s.name} interpolation="monotoneX" />
    ),
  );

  return (
    <Box style={{ height: '100%', width: '100%' }} ref={refChart}>
      <VictoryChart
        containerComponent={
          <CursorVoronoiContainer
            cursorDimension="x"
            labelComponent={<VictoryTooltip labelComponent={<ChartTooltip colorMap={makeColormap(series)} />} />}
            labels={({ datum }: { datum: ISeriesDatum }): string => chartFormatLabel(datum.y ? `${datum.y}` : '')}
            mouseFollowTooltips={true}
            voronoiDimension="x"
            voronoiPadding={0}
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
