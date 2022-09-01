import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartLegendTooltip,
  ChartThemeColor,
  createContainer,
} from '@patternfly/react-charts';
import React, { useRef } from 'react';

import { IMetric, IMetricDatum } from '../../utils/interfaces';
import {
  ITimes,
  chartAxisStyle,
  chartFormatLabel,
  chartTickFormatDate,
  formatTime,
  useDimensions,
} from '@kobsio/shared';
import { convertMetrics } from '../../utils/helpers';

interface IMetricChartProps {
  aggregationType: string;
  metrics: IMetric[];
  times: ITimes;
}

const MetricChart: React.FunctionComponent<IMetricChartProps> = ({
  aggregationType,
  metrics,
  times,
}: IMetricChartProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  const data = convertMetrics(metrics, aggregationType);
  const legendData = data.map((metric) => {
    return { childName: metric.name, name: metric.name };
  });

  const CursorVoronoiContainer = createContainer('voronoi', 'cursor');

  return (
    <div style={{ height: '100%', width: '100%' }} ref={refChart}>
      <Chart
        containerComponent={
          <CursorVoronoiContainer
            cursorDimension="x"
            labels={({ datum }: { datum: IMetricDatum }): string =>
              chartFormatLabel(datum.y ? `${datum.y} ${metrics[0].unit}` : '')
            }
            labelComponent={
              <ChartLegendTooltip
                themeColor={ChartThemeColor.multiOrdered}
                legendData={legendData}
                title={(datum: IMetricDatum): string =>
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
        padding={{ bottom: 20, left: 55, right: 0, top: 0 }}
        scale={{ x: 'time', y: 'linear' }}
        themeColor={ChartThemeColor.multiOrdered}
        width={chartSize.width}
        domain={{ x: [new Date(times.timeStart * 1000), new Date(times.timeEnd * 1000)] }}
      >
        <ChartAxis dependentAxis={false} tickFormat={chartTickFormatDate} showGrid={true} style={chartAxisStyle} />
        <ChartAxis dependentAxis={true} showGrid={true} label={metrics[0].unit} style={chartAxisStyle} />

        <ChartGroup>
          {data.map((metric, index) => (
            <ChartArea key={metric.name} data={metric.data} name={metric.name} interpolation="monotoneX" />
          ))}
        </ChartGroup>
      </Chart>
    </div>
  );
};

export default MetricChart;
