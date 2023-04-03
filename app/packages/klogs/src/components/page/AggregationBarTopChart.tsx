import { chartColors, chartTheme, ChartTooltip, roundNumber, useDimensions } from '@kobsio/core';
import { Box, useTheme } from '@mui/material';
import { FunctionComponent, useRef } from 'react';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryGroup, VictoryTooltip } from 'victory';

import { IAggregationData } from './AggregationTypes';

import { convertToBarChartTopData } from '../utils/aggregation';

interface IAggregationPieChartProps {
  data: IAggregationData;
  filters: string[];
}

const AggregationBarTopChart: FunctionComponent<IAggregationPieChartProps> = ({ data, filters }) => {
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);
  const muiTheme = useTheme();
  const theme = chartTheme(muiTheme);
  const barData = convertToBarChartTopData(data, filters);

  return (
    <Box style={{ height: '100%', width: '100%' }} ref={refChart}>
      <VictoryChart
        height={chartSize.height}
        padding={{ bottom: 30, left: 80, right: 0, top: 20 }}
        domainPadding={{ x: [50, 50], y: [0, 100] }}
        theme={theme}
        width={chartSize.width}
      >
        <VictoryAxis dependentAxis={false} tickFormat={() => ''} />
        <VictoryAxis dependentAxis={true} />

        <VictoryGroup>
          {barData.metrics.map((metric) => (
            <VictoryBar
              labelComponent={
                <VictoryTooltip
                  labelComponent={
                    <ChartTooltip
                      height={chartSize.height}
                      width={chartSize.width}
                      legendData={({ datum }: { datum: { xName: string; y: number } }) => ({
                        color: chartColors[0],
                        label: datum.xName,
                        unit: '',
                        value: datum.y ? roundNumber(datum.y, 4) : 'N/A',
                      })}
                    />
                  }
                />
              }
              key={metric[0].name}
              name={metric[0].name}
              data={metric}
            />
          ))}
        </VictoryGroup>
      </VictoryChart>
    </Box>
  );
};

export default AggregationBarTopChart;
