import React from 'react';
import { ResponsivePieCanvas } from '@nivo/pie';

import { CHART_THEME, COLOR_SCALE, ChartTooltip } from '@kobsio/shared';
import { IAggregationData } from '../../utils/interfaces';

interface IAggregationChartPieProps {
  data: IAggregationData;
}

const AggregationChartPie: React.FunctionComponent<IAggregationChartPieProps> = ({
  data,
}: IAggregationChartPieProps) => {
  // Convert the data returned by our API into a format, which can be used by the ResponsivePieCanvas component to
  // render the pie chart.
  const pieData =
    data.columns.length === 2
      ? data.rows.map((row) => {
          return {
            label: `${row[data.columns[0]]}`,
            value: row[data.columns[1]] as number,
          };
        })
      : [];

  return (
    <ResponsivePieCanvas
      arcLabelsSkipAngle={10}
      arcLabelsTextColor="#151515"
      arcLinkLabelsColor={{ from: 'color' }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor="#151515"
      arcLinkLabelsThickness={2}
      borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
      borderWidth={0}
      colors={COLOR_SCALE}
      data={pieData}
      id="label"
      innerRadius={0}
      isInteractive={true}
      margin={{ bottom: 25, left: 25, right: 25, top: 25 }}
      theme={CHART_THEME}
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      tooltip={(tooltip) => {
        return (
          <ChartTooltip
            anchor="right"
            color={tooltip.datum.color}
            label={`${tooltip.datum.label}: ${tooltip.datum.value}`}
            position={[0, 5]}
          />
        );
      }}
      value="value"
    />
  );
};

export default AggregationChartPie;
