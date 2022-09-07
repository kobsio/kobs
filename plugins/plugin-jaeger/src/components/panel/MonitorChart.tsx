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

import { IChartData, IChartDatum } from '../../utils/interfaces';
import {
  ITimes,
  chartAxisStyle,
  chartFormatLabel,
  chartTickFormatDate,
  formatTime,
  useDimensions,
} from '@kobsio/shared';

interface IMonitorChartProps {
  data: IChartData[];
  unit: string;
  times: ITimes;
}

const MonitorChart: React.FunctionComponent<IMonitorChartProps> = ({ data, unit, times }: IMonitorChartProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  const legendData = data.map((metric, index) => {
    return { childName: metric.name, name: metric.name };
  });

  const CursorVoronoiContainer = createContainer('voronoi', 'cursor');

  return (
    <div style={{ height: '100%', width: '100%' }} ref={refChart}>
      <Chart
        containerComponent={
          <CursorVoronoiContainer
            cursorDimension="x"
            labels={({ datum }: { datum: IChartDatum }): string =>
              chartFormatLabel(datum.y != null ? `${datum.y} ${unit}` : '')
            }
            labelComponent={
              <ChartLegendTooltip
                themeColor={ChartThemeColor.multiOrdered}
                legendData={legendData}
                title={(datum: IChartDatum): string => formatTime(Math.floor((datum.x as Date).getTime() / 1000))}
              />
            }
            mouseFollowTooltips={true}
            voronoiDimension="x"
            voronoiPadding={0}
          />
        }
        height={chartSize.height}
        padding={{ bottom: 20, left: 50, right: 0, top: 0 }}
        scale={{ x: 'time', y: 'linear' }}
        themeColor={ChartThemeColor.multiOrdered}
        width={chartSize.width}
        domain={{ x: [new Date(times.timeStart * 1000), new Date(times.timeEnd * 1000)] }}
      >
        <ChartAxis dependentAxis={false} tickFormat={chartTickFormatDate} showGrid={true} style={chartAxisStyle} />
        <ChartAxis dependentAxis={true} showGrid={true} style={chartAxisStyle} />

        <ChartGroup>
          {data.map((metric) => (
            <ChartLine key={metric.name} data={metric.data} name={metric.name} interpolation="monotoneX" />
          ))}
        </ChartGroup>
      </Chart>
    </div>
  );
};

export default MonitorChart;
