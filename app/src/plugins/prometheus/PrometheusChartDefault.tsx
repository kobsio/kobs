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
import React, { useEffect, useRef, useState } from 'react';

import { Data, Metrics } from 'proto/prometheus_grpc_web_pb';
import { formatTime } from 'utils/helpers';

interface ILabels {
  datum: Data.AsObject;
}

export interface IPrometheusChartDefaultProps {
  type: string;
  unit: string;
  stacked: boolean;
  disableLegend?: boolean;
  metrics: Metrics.AsObject[];
}

// Default represents our default chart types: area, bar and line chart. We display the user defined unit at the y axis
// of the chart. If the user enabled the stacked option the chart is wrapped in a ChartStack instead of the ChartGroup
// component.
// The documentation for the different chart types can be found in the Patternfly documentation:
// - Area Chart: https://www.patternfly.org/v4/charts/area-chart
// - Bar Chart: https://www.patternfly.org/v4/charts/bar-chart
// - Line Chart: https://www.patternfly.org/v4/charts/line-chart
//
// NOTE: Currently it is not possible to select a single time series in the chart. This should be changed in the future,
// by using an interactive legend: https://www.patternfly.org/v4/charts/legend-chart#interactive-legend
const PrometheusChartDefault: React.FunctionComponent<IPrometheusChartDefaultProps> = ({
  type,
  unit,
  stacked,
  disableLegend,
  metrics,
}: IPrometheusChartDefaultProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  // useEffect is executed on every render of this component. This is needed, so that we are able to use a width of 100%
  // and a static height for the chart.
  useEffect(() => {
    if (refChart && refChart.current) {
      setWidth(refChart.current.getBoundingClientRect().width);
      setHeight(refChart.current.getBoundingClientRect().height);
    }
  }, []);

  // In the following we are creating the container for the cursor container, we are generating the data for the legend
  // and we are creating the series component for each metric.
  const CursorVoronoiContainer = createContainer('voronoi', 'cursor');
  const legendData = metrics.map((metric, index) => ({ childName: `index${index}`, name: metric.label }));
  const series = metrics.map((metric, index) =>
    type === 'area' ? (
      <ChartArea key={index} data={metric.dataList} interpolation="monotoneX" name={`index${index}`} />
    ) : type === 'bar' ? (
      <ChartBar key={index} data={metric.dataList} name={`index${index}`} />
    ) : (
      <ChartLine key={index} data={metric.dataList} interpolation="monotoneX" name={`index${index}`} />
    ),
  );

  return (
    <div style={{ height: '300px', width: '100%' }} ref={refChart}>
      <Chart
        containerComponent={
          <CursorVoronoiContainer
            cursorDimension="x"
            labels={({ datum }: ILabels): string => `${datum.y} ${unit}`}
            labelComponent={
              <ChartLegendTooltip
                legendData={legendData}
                title={(point: Data.AsObject): string => formatTime(Math.floor(point.x / 1000))}
              />
            }
            mouseFollowTooltips
            voronoiDimension="x"
            voronoiPadding={0}
          />
        }
        height={height}
        legendData={legendData}
        legendPosition={disableLegend ? undefined : 'bottom'}
        padding={{ bottom: disableLegend ? 0 : 60, left: 60, right: 0, top: 0 }}
        scale={{ x: 'time', y: 'linear' }}
        themeColor={ChartThemeColor.multiOrdered}
        width={width}
      >
        <ChartAxis dependentAxis={false} showGrid={false} />
        <ChartAxis dependentAxis={true} showGrid={true} label={unit} />
        {stacked ? <ChartStack>{series}</ChartStack> : <ChartGroup>{series}</ChartGroup>}
      </Chart>
    </div>
  );
};

export default PrometheusChartDefault;
