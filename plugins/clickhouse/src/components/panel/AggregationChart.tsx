import React, { memo, useRef } from 'react';

import { IAggregationData, IAggregationOptions } from '../../utils/interfaces';
import AggregationChartBarTime from './AggregationChartBarTime';
import AggregationChartBarTop from './AggregationChartBarTop';
import AggregationChartLine from './AggregationChartLine';
import AggregationChartPie from './AggregationChartPie';
import { useDimensions } from '@kobsio/plugin-core';

interface IAggregationChartProps {
  minHeight: number;
  options: IAggregationOptions;
  data: IAggregationData;
}

const AggregationChart: React.FunctionComponent<IAggregationChartProps> = ({
  minHeight,
  options,
  data,
}: IAggregationChartProps) => {
  const refChartContainer = useRef<HTMLDivElement>(null);
  const chartContainerSize = useDimensions(refChartContainer);

  return (
    <div ref={refChartContainer} style={{ height: '100%', minHeight: `${minHeight}px`, width: '100%' }}>
      <div style={{ height: `${chartContainerSize.height}px`, width: '100%' }}>
        {options.chart === 'pie' ? (
          <AggregationChartPie data={data} />
        ) : options.chart === 'bar' && options.options.horizontalAxisOperation === 'top' ? (
          <AggregationChartBarTop filters={options.options.breakDownByFilters} data={data} />
        ) : options.chart === 'bar' && options.options.horizontalAxisOperation === 'time' ? (
          <AggregationChartBarTime filters={options.options.breakDownByFilters} data={data} />
        ) : options.chart === 'line' || options.chart === 'area' ? (
          <AggregationChartLine
            isArea={options.chart === 'area'}
            startTime={options.times.timeStart}
            endTime={options.times.timeEnd}
            filters={options.options.breakDownByFilters}
            data={data}
          />
        ) : null}
      </div>
    </div>
  );
};

export default memo(AggregationChart, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)) {
    return true;
  }

  return false;
});
