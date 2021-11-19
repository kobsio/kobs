import React from 'react';
import { ResponsiveLineCanvas } from '@nivo/line';

import { CHART_THEME, COLOR_SCALE, ChartTooltip } from '@kobsio/plugin-core';
import { convertToLineChartData, formatAxisBottom, formatFilter } from '../../utils/aggregation';
import { IAggregationData } from '../../utils/interfaces';

interface IAggregationChartLineProps {
  isArea: boolean;
  startTime: number;
  endTime: number;
  filters: string[];
  data: IAggregationData;
}

const AggregationChartLine: React.FunctionComponent<IAggregationChartLineProps> = ({
  isArea,
  startTime,
  endTime,
  filters,
  data,
}: IAggregationChartLineProps) => {
  const series = convertToLineChartData(data);

  return (
    <ResponsiveLineCanvas
      axisBottom={{
        format: formatAxisBottom(startTime, endTime),
      }}
      axisLeft={{
        format: '>-.2f',
      }}
      colors={COLOR_SCALE}
      curve="monotoneX"
      data={series}
      enableArea={isArea}
      enableGridX={false}
      enableGridY={true}
      enablePoints={false}
      xFormat="time:%Y-%m-%d %H:%M:%S"
      lineWidth={1}
      margin={{ bottom: 25, left: 50, right: 0, top: 0 }}
      theme={CHART_THEME}
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      tooltip={(tooltip) => {
        const isFirstHalf = new Date(tooltip.point.data.x).getTime() < (endTime + startTime) / 2;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pointData = tooltip.point.data as any;

        return (
          <ChartTooltip
            anchor={isFirstHalf ? 'right' : 'left'}
            color={tooltip.point.color}
            label={`${
              pointData.label
                ? `${pointData.label} - ${formatFilter(pointData.filter, filters)}`
                : `${formatFilter(pointData.filter, filters)}`
            }: ${tooltip.point.data.yFormatted}`}
            position={[0, 20]}
            title={tooltip.point.data.xFormatted.toString()}
          />
        );
      }}
      xScale={{ max: 'auto', min: 'auto', type: 'time' }}
      yScale={{ max: 'auto', min: 'auto', stacked: false, type: 'linear' }}
      yFormat=" >-.4f"
    />
  );
};

export default AggregationChartLine;
