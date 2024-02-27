import {
  ChartTooltip,
  chartTheme,
  chartTickFormatTime,
  chartTickFormatValue,
  formatTime,
  getChartColor,
  roundNumber,
  useDimensions,
} from '@kobsio/core';
import { Box, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from '@mui/material';
import { FunctionComponent, useRef } from 'react';
import {
  createContainer,
  VictoryArea,
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryGroup,
  VictoryLine,
  VictoryStack,
} from 'victory';

import { ILegend, ISQLData, ISQLDataRow } from '../utils/utils';

interface IMetrics {
  data: IDatum[];
  name: string;
}

interface IDatum {
  color: string;
  name: string;
  x: number | Date;
  y: number | null;
}

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

const calcMin = (data: IDatum[], unit: string | undefined): string => {
  let min = 0;

  for (let i = 0; i < data.length; i++) {
    const y = data[i].y;
    if (y) {
      if (i === 0) {
        min = y as number;
      }

      if (y < min) {
        min = data[i].y as number;
      }
    }
  }

  return `${roundNumber(min, 4)} ${unit ? unit : ''}`;
};

const calcMax = (data: IDatum[], unit: string | undefined): string => {
  let max = 0;

  for (let i = 0; i < data.length; i++) {
    const y = data[i].y;
    if (y) {
      if (i === 0) {
        max = y as number;
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (y! > max) {
        max = y as number;
      }
    }
  }

  return `${roundNumber(max, 4)} ${unit ? unit : ''}`;
};

const calcAvg = (data: IDatum[], unit: string | undefined): string => {
  let count = 0;
  let sum = 0;

  for (let i = 0; i < data.length; i++) {
    const y = data[i].y;
    if (y) {
      count = count + 1;
      sum = sum + (y as number);
    }
  }

  return `${count > 0 ? roundNumber(sum / count, 2) : 0} ${unit ? unit : ''}`;
};

const Legend: FunctionComponent<{
  legend?: ILegend;
  metrics: IMetrics[];
  yAxisUnit?: string;
}> = ({ metrics, yAxisUnit, legend }) => {
  return (
    <TableContainer>
      <Table size="small" padding="none">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Min</TableCell>
            <TableCell>Max</TableCell>
            <TableCell>Avg</TableCell>
            <TableCell>Current</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {metrics.map((metric, i) => (
            <TableRow key={metric.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell aria-label="Name">
                <Stack direction="row" alignItems="center">
                  <Box sx={{ backgroundColor: getChartColor(i), height: '8px', mr: '4px', width: '8px' }} />
                  {legend && legend.hasOwnProperty(metric.name) ? legend[metric.name] : metric.name}
                </Stack>
              </TableCell>
              <TableCell aria-label="Min">{calcMin(metric.data, yAxisUnit)}</TableCell>
              <TableCell aria-label="Max">{calcMax(metric.data, yAxisUnit)}</TableCell>
              <TableCell aria-label="Avg">{calcAvg(metric.data, yAxisUnit)}</TableCell>
              <TableCell aria-label="Current">
                {metric.data.length > 0
                  ? `${roundNumber(metric.data[metric.data?.length - 1].y ?? 0, 4)}${yAxisUnit ? ` ${yAxisUnit}` : ''}`
                  : ''}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const Chart: FunctionComponent<{
  legend?: ILegend;
  metrics: IMetrics[];
  type: 'area' | 'bar' | 'line';
  xAxisType?: string;
  yAxisStacked?: boolean;
  yAxisUnit?: string;
}> = ({ metrics, type, xAxisType, yAxisUnit, yAxisStacked, legend }) => {
  const refChart = useRef<HTMLDivElement>(null);
  const muiTheme = useTheme();
  const theme = chartTheme(muiTheme);
  const chartSize = useDimensions(refChart);

  const chartData = metrics.map((metric) => {
    if (type === 'area') {
      return (
        <VictoryArea
          key={metric.name}
          data={metric.data}
          name={legend && legend.hasOwnProperty(metric.name) ? legend[metric.name] : metric.name}
          interpolation="monotoneX"
        />
      );
    }

    if (type === 'bar') {
      return (
        <VictoryBar
          key={metric.name}
          data={metric.data}
          name={legend && legend.hasOwnProperty(metric.name) ? legend[metric.name] : metric.name}
        />
      );
    }

    if (type === 'line') {
      return (
        <VictoryLine
          key={metric.name}
          data={metric.data}
          name={legend && legend.hasOwnProperty(metric.name) ? legend[metric.name] : metric.name}
          interpolation="monotoneX"
        />
      );
    }

    throw new Error(`unsupported type "${type}"`);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CursorVoronoiContainer: any = createContainer('voronoi', 'cursor');

  return (
    <Box style={{ height: '100%', width: '100%' }} ref={refChart}>
      <VictoryChart
        containerComponent={
          <CursorVoronoiContainer
            cursorDimension="x"
            labels={() => ' '}
            labelComponent={
              <ChartTooltip
                height={chartSize.height}
                width={chartSize.width}
                legendData={({ datum }: { datum: IDatum }) => ({
                  color: datum.color,
                  label: datum.name,
                  title:
                    xAxisType === 'time'
                      ? formatTime(datum.x as Date)
                      : typeof datum.x === 'undefined'
                        ? undefined
                        : `${datum.x}`,
                  unit: yAxisUnit,
                  value: datum.y ? roundNumber(datum.y, 4) : 'N/A',
                })}
              />
            }
            mouseFollowTooltips={true}
            voronoiPadding={0}
          />
        }
        height={chartSize.height}
        padding={{ bottom: 30, left: yAxisUnit ? 55 : 50, right: 0, top: 0 }}
        domainPadding={{ x: type === 'bar' ? [20, 20] : [0, 0], y: [0, 30] }}
        scale={{ x: xAxisType === 'time' ? 'time' : 'linear', y: 'linear' }}
        theme={theme}
        width={chartSize.width}
      >
        <VictoryAxis dependentAxis={false} tickFormat={xAxisType === 'time' ? chartTickFormatTime : undefined} />
        <VictoryAxis fixLabelOverlap={true} dependentAxis={true} tickFormat={chartTickFormatValue} label={yAxisUnit} />

        {yAxisStacked ? <VictoryStack>{chartData}</VictoryStack> : <VictoryGroup>{chartData}</VictoryGroup>}
      </VictoryChart>
    </Box>
  );
};

export const SQLChartGeneric: FunctionComponent<{
  data: ISQLData;
  legend?: ILegend;
  type: 'area' | 'bar' | 'line';
  xAxisColumn: string;
  xAxisType?: string;
  yAxisColumns: string[];
  yAxisGroup?: string;
  yAxisStacked?: boolean;
  yAxisUnit?: string;
}> = ({ data, type, xAxisColumn, xAxisType, yAxisColumns, yAxisUnit, yAxisGroup, yAxisStacked, legend }) => {
  const metrics = data.rows ? getMetricsData(data.rows, xAxisColumn, xAxisType, yAxisColumns, yAxisGroup, legend) : [];

  return (
    <>
      <Box style={{ height: 'calc(100% - 80px)' }}>
        <Chart
          metrics={metrics}
          type={type}
          xAxisType={xAxisType}
          yAxisUnit={yAxisUnit}
          yAxisStacked={yAxisStacked}
          legend={legend}
        />
      </Box>

      <Box
        height={80}
        sx={{
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          overflowY: 'auto',
        }}
      >
        <Legend metrics={metrics} yAxisUnit={yAxisUnit} legend={legend} />
      </Box>
    </>
  );
};

export default SQLChartGeneric;
