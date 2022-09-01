import { Chart, ChartAxis, ChartBar, ChartGroup, ChartThemeColor } from '@patternfly/react-charts';
import React, { useRef } from 'react';

import { chartAxisStyle, useDimensions } from '@kobsio/shared';

interface INodeChartProps {
  data: { name: string; value: number }[];
  legend: string;
}

const NodeChart: React.FunctionComponent<INodeChartProps> = ({ data, legend }: INodeChartProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  return (
    <div style={{ height: `${75 + 40 * data.length}px` }} ref={refChart}>
      <Chart
        legendData={data.map((datum) => {
          return { name: datum.name };
        })}
        legendPosition="bottom-left"
        height={chartSize.height}
        padding={{ bottom: 100, left: 0, right: 0, top: 0 }}
        scale={{ x: 'linear', y: 'linear' }}
        width={chartSize.width}
        themeColor={ChartThemeColor.multiOrdered}
      >
        <ChartAxis
          dependentAxis={true}
          showGrid={false}
          tickFormat={(tick: number): string => `${tick} ${legend}`}
          style={chartAxisStyle}
        />
        <ChartGroup offset={30} horizontal={true}>
          {data.map((datum, index) => (
            <ChartBar
              key={datum.name}
              name={datum.name}
              data={[{ name: datum.name, x: legend, y: datum.value }]}
              barWidth={25}
            />
          ))}
        </ChartGroup>
      </Chart>
    </div>
  );
};

export default NodeChart;
