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

import { IDatum, ILegend, IMetrics } from '../../utils/interfaces';
import { chartAxisStyle, chartFormatLabel, chartTickFormatDate, formatTime, useDimensions } from '@kobsio/shared';

interface ISQLChartLineChartProps {
  metrics: IMetrics[];
  type: string;
  xAxisType?: string;
  yAxisUnit?: string;
  yAxisStacked?: boolean;
  legend?: ILegend;
}

export const SQLChartLineChart: React.FunctionComponent<ISQLChartLineChartProps> = ({
  metrics,
  type,
  xAxisType,
  yAxisUnit,
  yAxisStacked,
  legend,
}: ISQLChartLineChartProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  const legendData = metrics.map((metric, index) => {
    return {
      childName: legend && legend.hasOwnProperty(metric.name) ? legend[metric.name] : metric.name,
      name: legend && legend.hasOwnProperty(metric.name) ? legend[metric.name] : metric.name,
    };
  });

  const chartData = metrics.map((metric, index) =>
    type === 'area' ? (
      <ChartArea
        key={metric.name}
        data={metric.data}
        name={legend && legend.hasOwnProperty(metric.name) ? legend[metric.name] : metric.name}
        interpolation="monotoneX"
      />
    ) : type === 'bar' ? (
      <ChartBar
        key={metric.name}
        data={metric.data}
        name={legend && legend.hasOwnProperty(metric.name) ? legend[metric.name] : metric.name}
      />
    ) : (
      <ChartLine
        key={metric.name}
        data={metric.data}
        name={legend && legend.hasOwnProperty(metric.name) ? legend[metric.name] : metric.name}
        interpolation="monotoneX"
      />
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
              chartFormatLabel(datum.y ? `${datum.y}${yAxisUnit ? ` ${yAxisUnit}` : ''}` : '')
            }
            labelComponent={
              <ChartLegendTooltip
                themeColor={ChartThemeColor.multiOrdered}
                legendData={legendData}
                title={(datum: IDatum): string =>
                  xAxisType === 'time' ? formatTime(Math.floor((datum.x as Date).getTime() / 1000)) : `${datum.x}`
                }
              />
            }
            mouseFollowTooltips={true}
            voronoiDimension="x"
            voronoiPadding={0}
          />
        }
        height={chartSize.height}
        padding={{ bottom: 20, left: yAxisUnit ? 55 : 50, right: 0, top: 0 }}
        scale={{ x: 'time', y: 'linear' }}
        themeColor={ChartThemeColor.multiOrdered}
        width={chartSize.width}
      >
        <ChartAxis
          dependentAxis={false}
          tickFormat={xAxisType === 'time' ? chartTickFormatDate : undefined}
          showGrid={true}
          style={chartAxisStyle}
        />
        <ChartAxis dependentAxis={true} showGrid={true} label={yAxisUnit} style={chartAxisStyle} />

        {yAxisStacked ? <ChartStack>{chartData}</ChartStack> : <ChartGroup>{chartData}</ChartGroup>}
      </Chart>
    </div>
  );
};

export default SQLChartLineChart;
