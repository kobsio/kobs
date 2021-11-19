import React from 'react';
import { ResponsiveBarCanvas } from '@nivo/bar';

import { CHART_THEME, COLOR_SCALE, ChartTooltip } from '@kobsio/plugin-core';
import { convertToBarChartTimeData, formatFilter } from '../../utils/aggregation';
import { IAggregationData } from '../../utils/interfaces';

interface IAggregationChartBarTimeProps {
  filters: string[];
  data: IAggregationData;
}

const AggregationChartBarTime: React.FunctionComponent<IAggregationChartBarTimeProps> = ({
  filters,
  data,
}: IAggregationChartBarTimeProps) => {
  const barData = convertToBarChartTimeData(data);

  // barKeys contains all the keys which should be displayed in the bar chart. For that we have to create an array with
  // all keys (except the time key) and filter out all duplicates.
  const barKeys = barData
    .map((bar) => Object.keys(bar).filter((key) => key !== 'time'))
    .flat(1)
    .filter((value, index, self) => self.indexOf(value) === index);

  return (
    <ResponsiveBarCanvas
      axisLeft={{
        format: '>-.0s',
        legend: '',
        legendOffset: -40,
        legendPosition: 'middle',
      }}
      axisBottom={{
        legend: '',
        tickRotation: 45,
      }}
      borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
      borderRadius={0}
      borderWidth={0}
      colorBy="id"
      colors={COLOR_SCALE}
      data={barData}
      enableLabel={false}
      enableGridX={false}
      enableGridY={true}
      groupMode="stacked"
      indexBy="time"
      indexScale={{ round: true, type: 'band' }}
      isInteractive={true}
      keys={barKeys}
      layout="vertical"
      margin={{ bottom: 100, left: 50, right: 0, top: 0 }}
      maxValue="auto"
      minValue="auto"
      reverse={false}
      theme={CHART_THEME}
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      tooltip={(tooltip) => {
        const isFirstHalf = tooltip.index < barData.length / 2;
        const idParts = (tooltip.id as string).split(' - ');
        const filter = idParts[idParts.length - 1];
        const label = idParts.length === 2 ? idParts[0] : '';

        return (
          <ChartTooltip
            anchor={isFirstHalf ? 'right' : 'left'}
            color={tooltip.color}
            label={`${label ? `${label} - ${formatFilter(filter, filters)}` : formatFilter(filter, filters)}: ${
              tooltip.value
            }`}
            position={[0, 20]}
            title={tooltip.data.time as string}
          />
        );
      }}
      valueFormat=""
      valueScale={{ type: 'linear' }}
    />
  );
};

export default AggregationChartBarTime;
