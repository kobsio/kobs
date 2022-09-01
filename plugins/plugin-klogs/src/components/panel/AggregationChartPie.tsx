import { ChartPie, ChartThemeColor } from '@patternfly/react-charts';
import React, { useRef } from 'react';

import { IAggregationData } from '../../utils/interfaces';
import { useDimensions } from '@kobsio/shared';

interface IAggregationChartPieProps {
  data: IAggregationData;
}

const AggregationChartPie: React.FunctionComponent<IAggregationChartPieProps> = ({
  data,
}: IAggregationChartPieProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  const pieData =
    data.columns.length === 2
      ? data.rows.map((row) => {
          return {
            x: `${row[data.columns[0]]}`,
            y: row[data.columns[1]] as number,
          };
        })
      : [];

  return (
    <div style={{ height: '100%', width: '100%' }} ref={refChart}>
      <ChartPie
        constrainToVisibleArea={true}
        data={pieData}
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

export default AggregationChartPie;
