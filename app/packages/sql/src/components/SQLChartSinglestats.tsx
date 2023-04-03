import { Box, Stack, Typography } from '@mui/material';
import React from 'react';

import { ILegend, ISQLData, IThresholds } from './types';

const hexToRgb = (hex: string): { b: number; g: number; r: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        b: parseInt(result[3], 16),
        g: parseInt(result[2], 16),
        r: parseInt(result[1], 16),
      }
    : {
        b: 204,
        g: 102,
        r: 0,
      };
};

const DEFAULT_COLOR = 'rgba(0, 102, 204, 0.2)';

const getBackgroundColor = (value: string | number | string[] | number[], thresholds?: IThresholds): string => {
  if (!thresholds) {
    return DEFAULT_COLOR;
  }

  let num = 0;
  if (typeof value === 'string') {
    num = parseFloat(value);
  } else if (typeof value === 'number') {
    num = value;
  } else {
    return DEFAULT_COLOR;
  }

  const orderedThresholds: number[] = Object.keys(thresholds)
    .map((key) => parseFloat(key))
    .sort()
    .reverse();

  for (const threshold of orderedThresholds) {
    if (num > threshold) {
      const rgb = hexToRgb(thresholds[threshold]);
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
    }
  }

  return DEFAULT_COLOR;
};

interface ISQLChartSinglestatsProps {
  data: ISQLData;
  legend?: ILegend;
  thresholds?: IThresholds;
  yAxisColumns: string[];
  yAxisUnit?: string;
}

const SQLChartSinglestats: React.FunctionComponent<ISQLChartSinglestatsProps> = ({
  data,
  yAxisColumns,
  yAxisUnit,
  legend,
  thresholds,
}: ISQLChartSinglestatsProps) => {
  return (
    <Stack direction="row" spacing={4}>
      {data.columns
        ?.filter((column) => yAxisColumns.includes(column))
        .map((column) => (
          <Stack key={column} direction="column" width={'100%'}>
            {yAxisColumns.length === 1 ? null : (
              <Typography fontWeight="bold">{legend && column in legend ? legend[column] : column}</Typography>
            )}
            {data.rows?.map((row, index) => (
              <Box
                width={'100%'}
                key={index}
                sx={{ backgroundColor: getBackgroundColor(column in row ? row[column] : '', thresholds) }}
              >
                <Typography width={'100%'} fontSize={24} py={5} align="center">
                  {column in row ? row[column] : ''}
                  {yAxisUnit ? ` ${yAxisUnit}` : ''}
                </Typography>
              </Box>
            ))}
          </Stack>
        ))}
    </Stack>
  );
};

export default SQLChartSinglestats;
