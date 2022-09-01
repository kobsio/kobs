import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import {
  ChartAxis,
  ChartGroup,
  ChartLegendTooltip,
  ChartLine,
  ChartThemeColor,
  Chart as PatternflyChart,
  createContainer,
} from '@patternfly/react-charts';
import React, { useRef } from 'react';

import { IChart, IDatum } from '../../../utils/interfaces';
import {
  ITimes,
  chartAxisStyle,
  chartFormatLabel,
  chartTickFormatDate,
  formatTime,
  useDimensions,
} from '@kobsio/shared';

interface IChartProps {
  times: ITimes;
  chart: IChart;
}

export const Chart: React.FunctionComponent<IChartProps> = ({ times, chart }: IChartProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  const legendData = chart.series.map((serie) => {
    return { childName: serie.name, name: serie.name };
  });

  const CursorVoronoiContainer = createContainer('voronoi', 'cursor');

  return (
    <Card isCompact={true}>
      <CardTitle>{chart.title}</CardTitle>
      <CardBody>
        <div style={{ height: '300px', width: '100%' }} ref={refChart}>
          <PatternflyChart
            containerComponent={
              <CursorVoronoiContainer
                cursorDimension="x"
                labels={({ datum }: { datum: IDatum }): string =>
                  chartFormatLabel(datum.y ? `${datum.y}${chart.unit ? ` ${chart.unit}` : ''}` : '')
                }
                labelComponent={
                  <ChartLegendTooltip
                    themeColor={ChartThemeColor.multiOrdered}
                    legendData={legendData}
                    title={(datum: IDatum): string => formatTime(Math.floor((datum.x as Date).getTime() / 1000))}
                  />
                }
                mouseFollowTooltips={true}
                voronoiDimension="x"
                voronoiPadding={0}
              />
            }
            height={chartSize.height}
            padding={{ bottom: 20, left: chart.unit ? 55 : 50, right: 0, top: 0 }}
            scale={{ x: 'time', y: 'linear' }}
            themeColor={ChartThemeColor.multiOrdered}
            width={chartSize.width}
            domain={{ x: [new Date(times.timeStart * 1000), new Date(times.timeEnd * 1000)] }}
          >
            <ChartAxis dependentAxis={false} tickFormat={chartTickFormatDate} showGrid={true} style={chartAxisStyle} />
            <ChartAxis dependentAxis={true} showGrid={true} label={chart.unit} style={chartAxisStyle} />

            <ChartGroup>
              {chart.series.map((serie) => (
                <ChartLine key={serie.name} data={serie.data} name={serie.name} interpolation="monotoneX" />
              ))}
            </ChartGroup>
          </PatternflyChart>
        </div>
      </CardBody>
    </Card>
  );
};

export default Chart;
