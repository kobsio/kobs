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

import { IDatum, IMetric } from './interfaces';
import {
  ITimes,
  chartAxisStyle,
  chartFormatLabel,
  chartTickFormatDate,
  formatTime,
  useDimensions,
} from '@kobsio/shared';

interface IPrometheusChartProps {
  metrics: IMetric[];
  unit?: string;
  times: ITimes;
}

const PrometheusChart: React.FunctionComponent<IPrometheusChartProps> = ({
  metrics,
  unit,
  times,
}: IPrometheusChartProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  const legendData = metrics.map((metric, index) => {
    return { childName: metric.label, name: metric.label };
  });

  const chartData = metrics.map((metric, index) => (
    <ChartLine key={metrics[index].label} data={metric.data} name={metrics[index].label} interpolation="monotoneX" />
  ));

  const CursorVoronoiContainer = createContainer('voronoi', 'cursor');

  return (
    <div style={{ height: '100%', width: '100%' }} ref={refChart}>
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
  );
};

export default PrometheusChart;
