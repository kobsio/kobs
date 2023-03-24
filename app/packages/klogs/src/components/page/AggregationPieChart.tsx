import { chartColors, useDimensions } from '@kobsio/core';
import { Box, darken } from '@mui/material';
import { FunctionComponent, useRef } from 'react';
import { VictoryPie, VictoryTooltip } from 'victory';

import { IAggregationData } from './AggregationTypes';

interface IAggregationPieChartProps {
  data: IAggregationData;
}

const AggregationPieChart: FunctionComponent<IAggregationPieChartProps> = ({ data }) => {
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
    <Box sx={{ height: '100%', width: '100%' }} ref={refChart}>
      <VictoryPie
        data={pieData}
        height={chartSize.height}
        width={chartSize.width}
        colorScale={chartColors}
        labelComponent={
          <VictoryTooltip
            flyoutStyle={{
              fill: darken('#233044', 0.13),
              stroke: 'red',
              strokeWidth: 0,
            }}
            style={{
              fill: 'white',
            }}
            cornerRadius={0}
            flyoutPadding={{ bottom: 8, left: 20, right: 20, top: 8 }}
          />
        }
      />
    </Box>
  );
};

export default AggregationPieChart;
