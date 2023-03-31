import {
  chartTheme,
  chartTickFormatTime,
  chartTickFormatValue,
  ChartTooltip,
  formatTime,
  getChartColor,
  ITimes,
  roundNumber,
  useDimensions,
} from '@kobsio/core';
import { Card, CardContent, Typography, useTheme } from '@mui/material';
import { FunctionComponent, useRef } from 'react';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryGroup, VictoryVoronoiContainer } from 'victory';

import { IChart, IChartDatum } from '../utils/utils';

export const Chart: FunctionComponent<{ chart: IChart; times: ITimes }> = ({ times, chart }) => {
  const theme = useTheme();
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" pb={2}>
          {chart.title}
        </Typography>

        <div style={{ height: '300px', width: '100%' }} ref={refChart} data-testid="kiali-chart">
          <VictoryChart
            theme={chartTheme(theme)}
            containerComponent={
              <VictoryVoronoiContainer
                labels={() => ' '}
                labelComponent={
                  <ChartTooltip
                    height={chartSize.height}
                    width={chartSize.width}
                    legendData={({ datum }: { datum: IChartDatum }) => ({
                      color: getChartColor(chart.data.findIndex((d) => d.name === datum.name)),
                      label: datum.name,
                      title: formatTime(datum.x as Date),
                      unit: chart.unit,
                      value: datum.y !== null ? roundNumber(datum.y, 4) : 'N/A',
                    })}
                  />
                }
                mouseFollowTooltips={true}
              />
            }
            height={chartSize.height}
            padding={{ bottom: 25, left: chart.unit ? 60 : 55, right: 0, top: 0 }}
            scale={{ x: 'time', y: 'linear' }}
            width={chartSize.width}
            domain={{ x: [new Date(times.timeStart * 1000), new Date(times.timeEnd * 1000)] }}
          >
            <VictoryAxis dependentAxis={false} tickFormat={chartTickFormatTime} />
            <VictoryAxis dependentAxis={true} label={chart.unit} tickFormat={chartTickFormatValue} />

            <VictoryGroup>
              {chart.data.map((d) => (
                <VictoryLine key={d.name} data={d.data} name={d.name} interpolation="monotoneX" />
              ))}
            </VictoryGroup>
          </VictoryChart>
        </div>
      </CardContent>
    </Card>
  );
};

export default Chart;
