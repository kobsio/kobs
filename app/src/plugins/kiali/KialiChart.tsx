import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartLegendTooltip,
  ChartThemeColor,
  createContainer,
} from '@patternfly/react-charts';
import React, { useEffect, useRef, useState } from 'react';

import { Data, Metric } from 'proto/kiali_grpc_web_pb';
import { formatTime } from 'utils/helpers';

interface ILabels {
  datum: Data.AsObject;
}

export interface IKialiChartProps {
  unit: string;
  metrics: Metric.AsObject[];
}

const KialiChart: React.FunctionComponent<IKialiChartProps> = ({ unit, metrics }: IKialiChartProps) => {
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
  const legendData = metrics.map((metric, index) => ({
    childName: `index${index}`,
    name: metric.stat ? metric.stat : metric.name,
  }));
  const series = metrics.map((metric, index) => (
    <ChartArea key={index} data={metric.dataList} interpolation="monotoneX" name={`index${index}`} />
  ));

  return (
    <React.Fragment>
      <div style={{ height: '260px', width: '100%' }} ref={refChart}>
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
              voronoiPadding={{ bottom: 60, left: 60, right: 0, top: 0 }}
            />
          }
          height={height}
          legendData={legendData}
          legendPosition="bottom"
          padding={{ bottom: 60, left: 60, right: 0, top: 0 }}
          scale={{ x: 'time', y: 'linear' }}
          themeColor={ChartThemeColor.multiOrdered}
          width={width}
        >
          <ChartAxis dependentAxis={false} showGrid={false} />
          <ChartAxis dependentAxis={true} showGrid={true} label={unit} />
          <ChartGroup>{series}</ChartGroup>
        </Chart>
      </div>
    </React.Fragment>
  );
};

export default KialiChart;
