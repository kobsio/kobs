import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartGroup,
  ChartThemeColor,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import React, { useRef } from 'react';

import { chartAxisStyle, chartFormatLabel, useDimensions } from '@kobsio/shared';
import { IAggregationData } from '../../utils/interfaces';
import { convertToBarChartTopData } from '../../utils/aggregation';

interface IAggregationChartBarTopProps {
  data: IAggregationData;
  filters: string[];
}

const AggregationChartBarTop: React.FunctionComponent<IAggregationChartBarTopProps> = ({
  data,
  filters,
}: IAggregationChartBarTopProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  const barData = convertToBarChartTopData(data, filters);
  const noMetrics = barData.metrics.map((metric) => metric.length).reduce((prev, curr) => prev + curr, 0);
  const barWidth = (chartSize.width - 50) / noMetrics;

  return (
    <div style={{ height: '100%', width: '100%' }} ref={refChart}>
      <Chart
        containerComponent={
          <ChartVoronoiContainer
            labels={({ datum }: { datum: { name: string; x: string; y: number } }): string =>
              chartFormatLabel(`${datum.name}: ${datum.y}`)
            }
            constrainToVisibleArea={true}
          />
        }
        legendData={barData.legend}
        height={chartSize.height}
        padding={{ bottom: 0, left: 50, right: 0, top: 0 }}
        themeColor={ChartThemeColor.multiOrdered}
        width={chartSize.width}
      >
        <ChartAxis dependentAxis={true} showGrid={true} style={chartAxisStyle} />
        <ChartAxis dependentAxis={false} showGrid={true} style={chartAxisStyle} />

        <ChartGroup>
          {barData.metrics.map((metric, index) => (
            <ChartBar key={metric[0].name} name={metric[0].name} data={metric} barWidth={barWidth} barRatio={0.5} />
          ))}
        </ChartGroup>
      </Chart>
    </div>
  );
};

export default AggregationChartBarTop;
