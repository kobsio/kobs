import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartBar,
  ChartGroup,
  ChartLegendTooltip,
  ChartLine,
  ChartStack,
  ChartThemeColor,
  createContainer,
} from '@patternfly/react-charts';
import React, { useRef } from 'react';

import { IDatum, IMetric } from '../../utils/interfaces';
import {
  ITimes,
  chartAxisStyle,
  chartFormatLabel,
  chartTickFormatDate,
  formatTime,
  useDimensions,
} from '@kobsio/shared';

interface IChartTimeseriesProps {
  metrics: IMetric[];
  type: 'line' | 'area' | 'bar';
  stacked: boolean;
  unit?: string;
  min?: number;
  max?: number;
  color?: string;
  times: ITimes;
}

const ChartTimeseries: React.FunctionComponent<IChartTimeseriesProps> = ({
  metrics,
  type,
  stacked,
  unit,
  min,
  max,
  color,
  times,
}: IChartTimeseriesProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  const legendData = color
    ? [{ childName: metrics[0].label, name: metrics[0].label, symbol: { fill: color } }]
    : metrics.map((metric, index) => {
        return { childName: metric.label, name: metric.label };
      });

  const chartData = metrics.map((metric, index) =>
    type === 'area' ? (
      <ChartArea key={metrics[index].label} data={metric.data} name={metrics[index].label} interpolation="monotoneX" />
    ) : type === 'bar' ? (
      <ChartBar key={metrics[index].label} data={metric.data} name={metrics[index].label} />
    ) : (
      <ChartLine key={metrics[index].label} data={metric.data} name={metrics[index].label} interpolation="monotoneX" />
    ),
  );

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
        maxDomain={{ y: max }}
        minDomain={{ y: min }}
      >
        <ChartAxis dependentAxis={false} tickFormat={chartTickFormatDate} showGrid={true} style={chartAxisStyle} />
        <ChartAxis dependentAxis={true} showGrid={true} label={unit} style={chartAxisStyle} />

        {color ? (
          <ChartGroup color={color}>{chartData}</ChartGroup>
        ) : stacked ? (
          <ChartStack>{chartData}</ChartStack>
        ) : (
          <ChartGroup>{chartData}</ChartGroup>
        )}
      </Chart>
    </div>
  );
};

export default ChartTimeseries;
