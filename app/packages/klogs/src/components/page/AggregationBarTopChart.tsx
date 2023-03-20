import { useDimensions } from '@kobsio/core';
import { Box } from '@mui/material';
import { FunctionComponent, useRef } from 'react';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryGroup, VictoryVoronoiContainer } from 'victory';

import { IAggregationData } from './AggregationTypes';

import { chartFormatLabel, convertToBarChartTopData } from '../utils/aggregation';

// /**
//  * The `VoronoiContainer` component is used as container for the charts.
//  * It allows us to render a tooltip when hovering over the data points
//  */
// const VoronoiContainer = createContainer<VictoryVoronoiContainerProps>('voronoi');

interface IAggregationPieChartProps {
  data: IAggregationData;
  filters: string[];
}

const AggregationBarTopChart: FunctionComponent<IAggregationPieChartProps> = ({ data, filters }) => {
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);
  const barData = convertToBarChartTopData(data, filters);
  const noMetrics = barData.metrics.map((metric) => metric.length).reduce((prev, curr) => prev + curr, 0);
  const barWidth = (chartSize.width - 50) / noMetrics;

  return (
    <Box sx={{ height: '100%', width: '100%' }} ref={refChart}>
      <VictoryChart
        containerComponent={
          <VictoryVoronoiContainer
            labels={({ datum }: { datum: { name: string; x: string; y: number } }): string =>
              chartFormatLabel(`${datum.name}: ${datum.y}`)
            }
            // constrainToVisibleArea={true}
          />
        }
        // legendData={barData.legend}
        height={chartSize.height}
        padding={{ bottom: 0, left: 50, right: 0, top: 0 }}
        width={chartSize.width}
      >
        <VictoryAxis dependentAxis={true} />
        <VictoryAxis dependentAxis={false} />

        <VictoryGroup>
          {barData.metrics.map((metric, index) => (
            <VictoryBar key={metric[0].name} name={metric[0].name} data={metric} barWidth={barWidth} barRatio={0.5} />
          ))}
        </VictoryGroup>
      </VictoryChart>
    </Box>
  );
};

export default AggregationBarTopChart;
