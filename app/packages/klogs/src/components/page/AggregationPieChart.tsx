import { chartColors, useDimensions } from '@kobsio/core';
import { Box } from '@mui/material';
import { FunctionComponent, useRef } from 'react';
import { VictoryPie, VictoryTooltip } from 'victory';

import { IAggregationData } from './AggregationTypes';

interface IAggregationPieChartProps {
  data: IAggregationData;
}

const AggregationPieChart: FunctionComponent<IAggregationPieChartProps> = ({ data }) => {
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  const pieData =
    data.columns.length === 2
      ? data.rows.map((row) => {
          return {
            x: `${row[data.columns[0]]}`,
            y: row[data.columns[1]] as number,
          };
        })
      : [];

  return (
    <Box sx={{ height: '100%', width: '100%' }} ref={refChart}>
      <VictoryPie
        data={pieData}
        height={chartSize.height}
        width={chartSize.width}
        colorScale={chartColors}
        labelComponent={<VictoryTooltip />}
      />
    </Box>
  );
};

export default AggregationPieChart;
