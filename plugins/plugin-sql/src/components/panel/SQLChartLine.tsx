import React from 'react';

import { IDatum, ILegend, IMetrics, ISQLData, ISQLDataRow } from '../../utils/interfaces';
import SQLChartLineChart from './SQLChartLineChart';
import SQLChartLineLegend from './SQLChartLineLegend';

const getMetricsData = (
  rows: ISQLDataRow[],
  xAxisColumn: string,
  xAxisType: string | undefined,
  yAxisColumns: string[],
  yAxisGroup: string | undefined,
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

  for (const yAxisColumn of yAxisColumns) {
    if (yAxisGroup && groups.length > 0) {
      for (const group of groups) {
        const data: IDatum[] = [];

        for (const row of rows) {
          if (row[yAxisGroup] === group) {
            data.push({
              x: xAxisType === 'time' ? new Date(row[xAxisColumn] as string) : (row[xAxisColumn] as number),
              y: row.hasOwnProperty(yAxisColumn) ? (row[yAxisColumn] as number) : null,
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
          x: xAxisType === 'time' ? new Date(row[xAxisColumn] as string) : (row[xAxisColumn] as number),
          y: row.hasOwnProperty(yAxisColumn) ? (row[yAxisColumn] as number) : null,
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

interface ISQLChartLineProps {
  data: ISQLData;
  type: string;
  xAxisColumn: string;
  xAxisType?: string;
  xAxisUnit?: string;
  yAxisColumns: string[];
  yAxisUnit?: string;
  yAxisGroup?: string;
  yAxisStacked?: boolean;
  legend?: ILegend;
}

export const SQLChartLine: React.FunctionComponent<ISQLChartLineProps> = ({
  data,
  type,
  xAxisColumn,
  xAxisType,
  xAxisUnit,
  yAxisColumns,
  yAxisUnit,
  yAxisGroup,
  yAxisStacked,
  legend,
}: ISQLChartLineProps) => {
  const metrics = data.rows ? getMetricsData(data.rows, xAxisColumn, xAxisType, yAxisColumns, yAxisGroup) : [];

  return (
    <React.Fragment>
      <div style={{ height: 'calc(100% - 80px)' }}>
        <SQLChartLineChart
          metrics={metrics}
          type={type}
          xAxisType={xAxisType}
          yAxisUnit={yAxisUnit}
          yAxisStacked={yAxisStacked}
          legend={legend}
        />
      </div>

      <div className="pf-u-mt-md kobsio-hide-scrollbar" style={{ height: '60px', overflow: 'auto' }}>
        <SQLChartLineLegend metrics={metrics} yAxisUnit={yAxisUnit} legend={legend} />
      </div>
    </React.Fragment>
  );
};

export default SQLChartLine;
