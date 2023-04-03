import { chartColors, useDimensions } from '@kobsio/core';
import { Box, darken } from '@mui/material';
import React, { useRef } from 'react';
import { VictoryPie, VictoryTooltip } from 'victory';

import { ISQLData } from './types';

interface ISQLChartPieProps {
  data: ISQLData;
  pieLabelColumn: string;
  pieValueColumn: string;
}

const SQLChartPie: React.FunctionComponent<ISQLChartPieProps> = ({
  data,
  pieLabelColumn,
  pieValueColumn,
}: ISQLChartPieProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  const pieData = data.rows
    ? data.rows.map((row) => {
        return {
          x: row.hasOwnProperty(pieLabelColumn) ? row[pieLabelColumn] : '',
          y: row.hasOwnProperty(pieValueColumn) ? row[pieValueColumn] : null,
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
        labelComponent={
          <VictoryTooltip
            flyoutStyle={{
              fill: darken('#233044', 0.13),
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

export default SQLChartPie;
