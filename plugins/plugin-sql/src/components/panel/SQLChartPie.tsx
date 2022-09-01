import { ChartPie, ChartThemeColor } from '@patternfly/react-charts';
import React, { useRef } from 'react';

import { ISQLData } from '../../utils/interfaces';
import { useDimensions } from '@kobsio/shared';

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
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  const pieData = data.rows
    ? data.rows.map((row) => {
        return {
          x: row.hasOwnProperty(pieLabelColumn) ? row[pieLabelColumn] : '',
          y: row.hasOwnProperty(pieValueColumn) ? row[pieValueColumn] : null,
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

export default SQLChartPie;
