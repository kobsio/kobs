import { chartColors, useDimensions } from '@kobsio/core';
import { Box, darken } from '@mui/material';
import { FunctionComponent, useRef } from 'react';
import { VictoryPie, VictoryTooltip } from 'victory';

import { ISQLData } from '../utils/utils';

export const SQLChartPie: FunctionComponent<{
  data: ISQLData;
  pieLabelColumn: string;
  pieValueColumn: string;
}> = ({ data, pieLabelColumn, pieValueColumn }) => {
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
    <Box sx={{ height: 'calc(100% - 1px)', width: '100%' }} ref={refChart}>
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
