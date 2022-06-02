import { Datum, ResponsiveLineCanvas, Serie } from '@nivo/line';
import React from 'react';

import { CHART_THEME, COLOR_SCALE, ChartTooltip } from '@kobsio/shared';
import { ILegend, ISQLData, ISQLDataRow } from '../../utils/interfaces';

const getSeriesData = (
  rows: ISQLDataRow[],
  xAxisColumn: string,
  xAxisType: string | undefined,
  yAxisColumns: string[],
): Serie[] => {
  const series: Serie[] = [];

  for (const yAxisColumn of yAxisColumns) {
    const data: Datum[] = [];

    for (const row of rows) {
      data.push({
        x: xAxisType === 'time' ? new Date(row[xAxisColumn] as string) : (row[xAxisColumn] as number),
        y: row.hasOwnProperty(yAxisColumn) ? (row[yAxisColumn] as number) : null,
      });
    }

    series.push({
      data: data,
      id: yAxisColumn,
    });
  }

  return series;
};

interface ISQLChartLineProps {
  data: ISQLData;
  type: string;
  xAxisColumn: string;
  xAxisType?: string;
  xAxisUnit?: string;
  yAxisColumns: string[];
  yAxisUnit?: string;
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
  yAxisStacked,
  legend,
}: ISQLChartLineProps) => {
  const series = data.rows ? getSeriesData(data.rows, xAxisColumn, xAxisType, yAxisColumns) : [];

  return (
    <ResponsiveLineCanvas
      axisBottom={{
        format: xAxisType === 'time' ? '%m-%d %H:%M:%S' : '>-.2f',
        tickValues:
          series.length > 0
            ? series[0].data
                .filter(
                  (datum, index) =>
                    index !== 0 &&
                    index !== series[0].data.length - 1 &&
                    (index + 1) %
                      (Math.floor(series[0].data.length / 10) > 2 ? Math.floor(series[0].data.length / 10) : 2) ===
                      0,
                )
                .map((datum) => datum.x)
            : undefined,
      }}
      axisLeft={{
        format: '>-.2f',
        legend: yAxisUnit,
        legendOffset: -40,
        legendPosition: 'middle',
      }}
      colors={COLOR_SCALE}
      curve="monotoneX"
      data={series}
      enableArea={type === 'area'}
      enableGridX={false}
      enableGridY={true}
      enablePoints={false}
      xFormat={xAxisType === 'time' ? 'time:%Y-%m-%d %H:%M:%S' : '>-.4f'}
      lineWidth={1}
      margin={{ bottom: 25, left: 50, right: 0, top: 0 }}
      theme={CHART_THEME}
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      tooltip={(tooltip) => {
        return (
          <ChartTooltip
            anchor="center"
            color={tooltip.point.color}
            label={`${
              legend && legend.hasOwnProperty(tooltip.point.serieId)
                ? legend[tooltip.point.serieId]
                : tooltip.point.serieId
            } ${tooltip.point.data.yFormatted}`}
            position={[0, 50]}
            title={tooltip.point.data.xFormatted.toString()}
          />
        );
      }}
      xScale={{ max: 'auto', min: 'auto', type: xAxisType === 'time' ? 'time' : 'linear' }}
      yScale={{
        max: 'auto',
        min: 'auto',
        stacked: yAxisStacked ? true : false,
        type: 'linear',
      }}
      yFormat=">-.4f"
    />
  );
};

export default SQLChartLine;
