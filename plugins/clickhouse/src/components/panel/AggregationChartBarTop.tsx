import React from 'react';
import { ResponsiveBarCanvas } from '@nivo/bar';

import { CHART_THEME, COLOR_SCALE, ChartTooltip } from '@kobsio/plugin-core';
import { convertToBarChartTopData, formatFilter } from '../../utils/aggregation';
import { IAggregationData } from '../../utils/interfaces';

interface IAggregationChartBarTopProps {
  filters: string[];
  data: IAggregationData;
}

const AggregationChartBarTop: React.FunctionComponent<IAggregationChartBarTopProps> = ({
  data,
  filters,
}: IAggregationChartBarTopProps) => {
  const barData = convertToBarChartTopData(data);

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
      colorBy={barData.columns.length > 1 ? 'id' : 'indexValue'}
      colors={COLOR_SCALE}
      data={barData.data}
      enableLabel={false}
      enableGridX={false}
      enableGridY={true}
      groupMode="stacked"
      indexBy="label"
      indexScale={{ round: true, type: 'band' }}
      isInteractive={true}
      keys={barData.columns}
      layout="vertical"
      margin={{ bottom: 100, left: 50, right: 0, top: 0 }}
      maxValue="auto"
      minValue="auto"
      reverse={false}
      theme={CHART_THEME}
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      tooltip={(tooltip) => {
        const isFirstHalf = tooltip.index < barData.data.length / 2;

        return (
          <ChartTooltip
            anchor={isFirstHalf ? 'right' : 'left'}
            color={tooltip.color}
            label={`${formatFilter(tooltip.id as string, filters)}: ${tooltip.value}`}
            position={[0, 5]}
            title={tooltip.indexValue as string}
          />
        );
      }}
      valueFormat=""
      valueScale={{ type: 'linear' }}
    />
  );
};

export default AggregationChartBarTop;
