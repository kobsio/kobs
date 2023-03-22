import { chartTheme, useDimensions } from '@kobsio/core';
import { Box, useTheme } from '@mui/material';
import { FunctionComponent, useRef } from 'react';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryGroup, VictoryTooltip } from 'victory';

import { IAggregationData } from './AggregationTypes';

import { convertToBarChartTopData } from '../utils/aggregation';

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
        padding={{ bottom: 30, left: 50, right: 0, top: 20 }}
        domainPadding={{ x: [100, 100], y: [0, 30] }}
        theme={theme}
        width={chartSize.width}
      >
        <VictoryAxis dependentAxis={false} tickFormat={() => ''} />
        <VictoryAxis dependentAxis={true} />

        <VictoryGroup>
          {barData.metrics.map((metric) => (
            <VictoryBar labelComponent={<VictoryTooltip />} key={metric[0].name} name={metric[0].name} data={metric} />
          ))}
        </VictoryGroup>
      </VictoryChart>
    </Box>
  );
};

export default AggregationBarTopChart;
