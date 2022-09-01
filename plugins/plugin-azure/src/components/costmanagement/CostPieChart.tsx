import { ChartPie, ChartThemeColor } from '@patternfly/react-charts';
import React, { useRef } from 'react';

import { IQueryResult } from './interfaces';
import { convertQueryResult } from '../../utils/helpers';
import { useDimensions } from '@kobsio/shared';

interface ICostPieChartProps {
  data: IQueryResult;
}

export const CostPieChart: React.FunctionComponent<ICostPieChartProps> = ({ data }: ICostPieChartProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  return (
    <div style={{ height: '100%', width: '100%' }} ref={refChart}>
      <ChartPie
        constrainToVisibleArea={true}
        data={convertQueryResult(data)}
        height={chartSize.height}
        padding={{
          bottom: 0,
          left: 0,
          right: 0,
          top: 0,
        }}
        width={chartSize.width}
        themeColor={ChartThemeColor.multiOrdered}
      />
    </div>
  );
};
