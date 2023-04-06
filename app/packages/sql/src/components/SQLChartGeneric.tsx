import { getChartColor } from '@kobsio/core';
import { Box } from '@mui/material';
import React from 'react';

import SQLChartGenericChart from './SQLChartGenericChart';
import SQLChartGenericLegend from './SQLChartGenericLegend';
import { IDatum, ILegend, IMetrics, ISQLData, ISQLDataRow } from './types';

const getMetricsData = (
  rows: ISQLDataRow[],
  xAxisColumn: string,
  xAxisType: string | undefined,
  yAxisColumns: string[],
  yAxisGroup: string | undefined,
  legend: ILegend | undefined,
): IMetrics[] => {
  const groups: string[] = [];
  const metrics: IMetrics[] = [];

  if (yAxisGroup) {
    for (const value of rows) {
      if (yAxisGroup in value && !groups.includes(value[yAxisGroup].toString())) {
        groups.push(value[yAxisGroup].toString());
      }
    }
  }

  for (let yi = 0; yi < yAxisColumns.length; yi++) {
    const yAxisColumn = yAxisColumns[yi];
    const legendName = legend ? (legend.hasOwnProperty(yAxisColumn) ? legend[yAxisColumn] : yAxisColumn) : yAxisColumn;
    if (yAxisGroup && groups.length > 0) {
      for (const group of groups) {
        const data: IDatum[] = [];

        for (const row of rows) {
          if (row[yAxisGroup] === group) {
            data.push({
              color: getChartColor(yi),
              name: legendName,
              x: xAxisType === 'time' ? new Date(row[xAxisColumn] as string) : (row[xAxisColumn] as number),
              y: row.hasOwnProperty(yAxisColumn) ? Number(row[yAxisColumn]) : null,
            });
          }
        }

        metrics.push({
          data: data,
          name: `${yAxisColumn}-${group}`,
        });
      }
    } else {
      const data: IDatum[] = [];

      for (const row of rows) {
        data.push({
          color: getChartColor(yi),
          name: legendName,
          x: xAxisType === 'time' ? new Date(row[xAxisColumn] as string) : (row[xAxisColumn] as number),
          y: row.hasOwnProperty(yAxisColumn) ? Number(row[yAxisColumn]) : null,
        });
      }

      metrics.push({
        data: data,
        name: yAxisColumn,
      });
    }
  }

  return metrics;
};

interface ISQLChartGenericProps {
  data: ISQLData;
  legend?: ILegend;
  type: 'area' | 'bar' | 'line';
  xAxisColumn: string;
  xAxisType?: string;
  yAxisColumns: string[];
  yAxisGroup?: string;
  yAxisStacked?: boolean;
  yAxisUnit?: string;
}

export const SQLChartGeneric: React.FunctionComponent<ISQLChartGenericProps> = ({
  data,
  type,
  xAxisColumn,
  xAxisType,
  yAxisColumns,
  yAxisUnit,
  yAxisGroup,
  yAxisStacked,
  legend,
}: ISQLChartGenericProps) => {
  const metrics = data.rows ? getMetricsData(data.rows, xAxisColumn, xAxisType, yAxisColumns, yAxisGroup, legend) : [];

  return (
    <React.Fragment>
      <Box style={{ height: 'calc(100% - 80px)' }}>
        <SQLChartGenericChart
          metrics={metrics}
          type={type}
          xAxisType={xAxisType}
          yAxisUnit={yAxisUnit}
          yAxisStacked={yAxisStacked}
          legend={legend}
        />
      </Box>

      <Box className="pf-u-mt-md kobsio-hide-scrollbar" style={{ height: '60px', overflow: 'auto' }}>
        <SQLChartGenericLegend metrics={metrics} yAxisUnit={yAxisUnit} legend={legend} />
      </Box>
    </React.Fragment>
  );
};

export default SQLChartGeneric;
