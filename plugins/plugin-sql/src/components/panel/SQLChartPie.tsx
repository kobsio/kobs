import React from 'react';
import { ResponsivePieCanvas } from '@nivo/pie';

import { CHART_THEME, COLOR_SCALE, ChartTooltip } from '@kobsio/shared';
import { ISQLData } from '../../utils/interfaces';

interface ISQLChartPieProps {
  data: ISQLData;
  pieLabelColumn: string;
  pieValueColumn: string;
}

const SQLChartPie: React.FunctionComponent<ISQLChartPieProps> = ({
  data,
  pieLabelColumn,
  pieValueColumn,
}: ISQLChartPieProps) => {
  const pieData = data.rows
    ? data.rows.map((row) => {
        return {
          label: row.hasOwnProperty(pieLabelColumn) ? row[pieLabelColumn] : '',
          value: row.hasOwnProperty(pieValueColumn) ? row[pieValueColumn] : null,
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

export default SQLChartPie;
