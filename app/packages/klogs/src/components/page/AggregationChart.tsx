import { useDimensions } from '@kobsio/core';
import { FunctionComponent, useRef } from 'react';

import AggregationBarTopChart from './AggregationBarTopChart';
import AggregationChartTimeseries from './AggregationChartTimeseries';
import AggregationPieChart from './AggregationPieChart';
import { IAggregationData, IChartOptions } from './AggregationTypes';

interface IAggregationChartProps {
  data: IAggregationData;
  options: IChartOptions;
}

const AggregationChart: FunctionComponent<IAggregationChartProps> = ({ options, data }: IAggregationChartProps) => {
  const refChartContainer = useRef<HTMLDivElement>(null);
  const chartContainerSize = useDimensions(refChartContainer);

  return (
    <div ref={refChartContainer} style={{ height: '100%', width: '100%' }}>
      <div style={{ height: `${chartContainerSize.height}px`, width: '100%' }}>
        {options.chart === 'pie' && data && <AggregationPieChart data={data} />}
        {options.chart === 'bar' && options.horizontalAxisOperation === 'top' && data && (
          <AggregationBarTopChart data={data} filters={[]} />
        )}
        {(options.chart === 'bar' || options.chart === 'area' || options.chart === 'line') &&
          options.horizontalAxisOperation === 'time' &&
          data && <AggregationChartTimeseries data={data} filters={[]} type={options.chart} />}
      </div>
    </div>
  );
};

export default AggregationChart;
