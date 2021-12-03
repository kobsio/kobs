import React from 'react';
import { ResponsivePieCanvas } from '@nivo/pie';

import { IQueryResult } from './interfaces';
import { convertQueryResult } from '../../utils/helpers';

interface ICostPieChartProps {
  data: IQueryResult;
}

export const CostPieChart: React.FunctionComponent<ICostPieChartProps> = ({ data }: ICostPieChartProps) => {
  return (
    <ResponsivePieCanvas
      data={convertQueryResult(data)}
      margin={{ bottom: 80, left: 80, right: 80, top: 40 }}
      valueFormat=" >-.2f"
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      colors={{ scheme: 'paired' }}
      borderWidth={2}
      borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
      arcLinkLabelsSkipAngle={5}
      arcLinkLabelsTextColor="#333333"
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: 'color' }}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
      legends={[
        {
          anchor: 'right',
          direction: 'column',
          itemDirection: 'left-to-right',
          itemHeight: 20,
          itemWidth: 100,
          itemsSpacing: 5,
          justify: false,
          symbolSize: 20,
          translateX: 0,
          translateY: 0,
        },
      ]}
    />
  );
};
