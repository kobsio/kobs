import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLegendTooltip,
  ChartLine,
  ChartThemeColor,
  createContainer,
} from '@patternfly/react-charts';
import React, { useRef } from 'react';

import {
  ITimes,
  chartAxisStyle,
  chartFormatLabel,
  chartTickFormatDate,
  formatTime,
  useDimensions,
} from '@kobsio/shared';
import { IDatum } from '../../../utils/prometheus/interfaces';

interface IDetailsTopChartProps {
  title: string;
  metrics: { name: string; data: { x: Date; y: number }[] }[];
  unit?: string;
  times: ITimes;
}

const DetailsTopChart: React.FunctionComponent<IDetailsTopChartProps> = ({
  title,
  metrics,
  unit,
  times,
}: IDetailsTopChartProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  const legendData = metrics.map((metric, index) => {
    return { childName: metric.name, name: metric.name };
  });

  const chartData = metrics.map((metric, index) => (
    <ChartLine key={metrics[index].name} data={metric.data} name={metrics[index].name} interpolation="monotoneX" />
  ));

  const CursorVoronoiContainer = createContainer('voronoi', 'cursor');

  return (
    <Card isCompact={true}>
      <CardTitle>{title}</CardTitle>
      <CardBody>
        <div style={{ height: '300px' }} ref={refChart}>
          <Chart
            containerComponent={
              <CursorVoronoiContainer
                cursorDimension="x"
                labels={({ datum }: { datum: IDatum }): string =>
                  chartFormatLabel(datum.y ? `${datum.y}${unit ? ` ${unit}` : ''}` : '')
                }
                labelComponent={
                  <ChartLegendTooltip
                    themeColor={ChartThemeColor.multiOrdered}
                    legendData={legendData}
                    title={(datum: IDatum): string =>
                      metrics.length > 0 ? formatTime(Math.floor((datum.x as Date).getTime() / 1000)) : ''
                    }
                  />
                }
                mouseFollowTooltips={true}
                voronoiDimension="x"
                voronoiPadding={0}
              />
            }
            height={chartSize.height}
            padding={{ bottom: 20, left: unit ? 55 : 50, right: 0, top: 0 }}
            scale={{ x: 'time', y: 'linear' }}
            themeColor={ChartThemeColor.multiOrdered}
            width={chartSize.width}
            domain={{ x: [new Date(times.timeStart * 1000), new Date(times.timeEnd * 1000)] }}
          >
            <ChartAxis dependentAxis={false} tickFormat={chartTickFormatDate} showGrid={true} style={chartAxisStyle} />
            <ChartAxis dependentAxis={true} showGrid={true} label={unit} style={chartAxisStyle} />

            <ChartGroup>{chartData}</ChartGroup>
          </Chart>
        </div>
      </CardBody>
    </Card>
  );
};

export default DetailsTopChart;
