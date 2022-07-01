import React from 'react';
import { ResponsivePieCanvas } from '@nivo/pie';

import { CHART_THEME, COLOR_SCALE, ChartTooltip } from '@kobsio/shared';
import { IQueryResult } from './interfaces';
import { convertQueryResult } from '../../utils/helpers';

interface ICostPieChartProps {
  data: IQueryResult;
}

export const CostPieChart: React.FunctionComponent<ICostPieChartProps> = ({ data }: ICostPieChartProps) => {
  return (
    <ResponsivePieCanvas
      activeOuterRadiusOffset={8}
      arcLinkLabelsSkipAngle={5}
      arcLinkLabelsTextColor="#333333"
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: 'color' }}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
      borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
      borderWidth={2}
      colors={COLOR_SCALE}
      cornerRadius={3}
      data={convertQueryResult(data)}
      innerRadius={0.5}
      isInteractive={false}
      margin={{ bottom: 80, left: 80, right: 80, top: 40 }}
      padAngle={0.7}
      theme={CHART_THEME}
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      tooltip={(tooltip) => {
        let currency = '';
        const row = data.properties.rows.filter((row) => row[1] === tooltip.datum.label.toString());

        if (row.length === 1) {
          currency = row[0][2];
        }

        return (
          <ChartTooltip
            color={tooltip.datum.color}
            label={`${tooltip.datum.formattedValue} ${currency}`}
            title={tooltip.datum.label.toString()}
          />
        );
      }}
      valueFormat=" >-.2f"
    />
  );
};
