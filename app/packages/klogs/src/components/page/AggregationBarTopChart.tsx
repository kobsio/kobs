import { chartColors, chartTheme, ChartTooltip, roundNumber, useDimensions } from '@kobsio/core';
import { Square } from '@mui/icons-material';
import { Box, darken, useTheme } from '@mui/material';
import { FunctionComponent, useRef } from 'react';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryGroup, VictoryTooltip, FlyoutProps } from 'victory';

import { IAggregationData } from './AggregationTypes';

import { convertToBarChartTopData } from '../utils/aggregation';

interface IChartTooltipContentProps extends FlyoutProps {
  datum: { xName: string; y: number };
}

/**
 * ChartTooltipContent renders a timestamp a color-indicator and the metric name,
 * when the user hovers over a datapoint inside the chart area
 */
const ChartTooltipContent: FunctionComponent<IChartTooltipContentProps> = (props) => {
  return (
    <Box sx={{ backgroundColor: darken('#233044', 0.13), p: 4 }}>
      <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: 2 }}>
        <Square sx={{ color: chartColors[0] }} />
        <Box component="span" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {props.datum.xName}
        </Box>
        <Box component="span" sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
          {roundNumber(props.datum.y ?? 0, 4)}
        </Box>
      </Box>
    </Box>
  );
};

interface IAggregationPieChartProps {
  data: IAggregationData;
  filters: string[];
}

const AggregationBarTopChart: FunctionComponent<IAggregationPieChartProps> = ({ data, filters }) => {
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);
  const muiTheme = useTheme();
  const theme = chartTheme(muiTheme);
  const barData = convertToBarChartTopData(data, filters);

  return (
    <Box style={{ height: '100%', width: '100%' }} ref={refChart}>
      <VictoryChart
        height={chartSize.height}
        padding={{ bottom: 30, left: 80, right: 0, top: 20 }}
        domainPadding={{ x: [50, 50], y: [0, 100] }}
        theme={theme}
        width={chartSize.width}
      >
        <VictoryAxis dependentAxis={false} tickFormat={() => ''} />
        <VictoryAxis dependentAxis={true} />

        <VictoryGroup>
          {barData.metrics.map((metric) => (
            <VictoryBar
              labelComponent={
                <VictoryTooltip
                  labelComponent={<ChartTooltip component={ChartTooltipContent} width={chartSize.width} />}
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

export default AggregationBarTopChart;
