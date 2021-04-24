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
import { IData, transformData } from 'plugins/prometheus/helpers';
import PrometheusChartDefaultLegend from 'plugins/prometheus/PrometheusChartDefaultLegend';
import { formatTime } from 'utils/helpers';

interface ILabels {
  datum: IData;
}

export interface IPrometheusChartDefaultProps {
  type: string;
  unit: string;
  stacked: boolean;
  legend: string;
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
  legend,
  metrics,
}: IPrometheusChartDefaultProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [hiddenMetrics, setHiddenMetrics] = useState<string[]>([]);

  const toogleMetric = (index: string): void => {
    let tmpHiddenMetrics = [...hiddenMetrics];

    if (tmpHiddenMetrics.includes(index)) {
      tmpHiddenMetrics = tmpHiddenMetrics.filter((f) => f !== index);
    } else {
      tmpHiddenMetrics.push(index);
    }

    setHiddenMetrics(tmpHiddenMetrics);
  };

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
      <ChartArea
        key={index}
        data={transformData(metric.dataList, hiddenMetrics.includes(`index${index}`))}
        interpolation="monotoneX"
        name={`index${index}`}
      />
    ) : type === 'bar' ? (
      <ChartBar
        key={index}
        data={transformData(metric.dataList, hiddenMetrics.includes(`index${index}`))}
        name={`index${index}`}
      />
    ) : (
      <ChartLine
        key={index}
        data={transformData(metric.dataList, hiddenMetrics.includes(`index${index}`))}
        interpolation="monotoneX"
        name={`index${index}`}
      />
    ),
  );

  return (
    <React.Fragment>
      <div
        style={{ height: legend === 'table' ? '240px' : legend === 'disabled' ? '336px' : '270px', width: '100%' }}
        ref={refChart}
      >
        <Chart
          containerComponent={
            <CursorVoronoiContainer
              cursorDimension="x"
              labels={({ datum }: ILabels): string | null => (datum.y ? `${datum.y} ${unit}` : null)}
              labelComponent={
                <ChartLegendTooltip
                  legendData={legendData}
                  title={(point: Data.AsObject): string => formatTime(Math.floor(point.x / 1000))}
                />
              }
              mouseFollowTooltips
              voronoiDimension="x"
              voronoiPadding={{ bottom: 30, left: 60, right: 0, top: 0 }}
            />
          }
          height={height}
          legendPosition={undefined}
          padding={{ bottom: 30, left: 60, right: 0, top: 0 }}
          scale={{ x: 'time', y: 'linear' }}
          themeColor={ChartThemeColor.multiOrdered}
          width={width}
        >
          <ChartAxis dependentAxis={false} showGrid={false} />
          <ChartAxis dependentAxis={true} showGrid={true} label={unit} />
          {stacked ? <ChartStack>{series}</ChartStack> : <ChartGroup>{series}</ChartGroup>}
        </Chart>
      </div>
      <PrometheusChartDefaultLegend
        legend={legend}
        legendData={legendData}
        metrics={metrics}
        hiddenMetrics={hiddenMetrics}
        toogleMetric={toogleMetric}
      />
    </React.Fragment>
  );
};

export default PrometheusChartDefault;
