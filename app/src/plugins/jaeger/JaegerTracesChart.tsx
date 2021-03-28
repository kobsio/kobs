import { Card, CardBody } from '@patternfly/react-core';
import {
  Chart,
  ChartAxis,
  ChartLegendTooltip,
  ChartScatter,
  ChartThemeColor,
  createContainer,
} from '@patternfly/react-charts';
import React, { useEffect, useRef, useState } from 'react';

import { ITrace, getDuration } from 'plugins/jaeger/helpers';
import { formatTime } from 'utils/helpers';

interface IChartData {
  x: number;
  y: number;
  z: number;
}

interface ILabels {
  datum: IChartData;
}

interface IJaegerTracesChartProps {
  isInDrawer: boolean;
  traces: ITrace[];
}

const JaegerTracesChart: React.FunctionComponent<IJaegerTracesChartProps> = ({
  isInDrawer,
  traces,
}: IJaegerTracesChartProps) => {
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

  if (traces.length === 0) {
    return null;
  }

  const CursorVoronoiContainer = createContainer('voronoi', 'cursor');
  const legendData = traces.map((trace) => {
    const rootSpan = trace.spans[0];
    const rootSpanProcess = trace.processes[rootSpan.processID];
    const rootSpanService = rootSpanProcess.serviceName;
    return { childName: 'trace', name: `${rootSpanService}: ${rootSpan.operationName}` };
  });
  const data: IChartData[] = traces.map((trace) => {
    return {
      x: Math.floor(trace.spans[0].startTime / 1000),
      y: getDuration(trace.spans),
      z: trace.spans.length,
    };
  });

  return (
    <Card isFlat={true} isCompact={true}>
      <CardBody>
        <div style={{ height: '200px', width: '100%' }} ref={refChart}>
          <Chart
            containerComponent={
              <CursorVoronoiContainer
                cursorDimension="x"
                labels={({ datum }: ILabels): string => `${datum.y}ms`}
                labelComponent={
                  <ChartLegendTooltip
                    legendData={legendData}
                    title={(point: IChartData): string => formatTime(Math.floor(point.x / 1000))}
                  />
                }
                mouseFollowTooltips={true}
                voronoiDimension="x"
                voronoiPadding={0}
              />
            }
            height={height}
            legendData={legendData}
            legendPosition={undefined}
            padding={{ bottom: 30, left: 0, right: 0, top: 0 }}
            scale={{ x: 'time', y: 'linear' }}
            themeColor={ChartThemeColor.multiOrdered}
            width={width}
          >
            <ChartAxis dependentAxis={false} showGrid={false} />
            <ChartScatter
              style={{ data: { fill: 'var(--pf-global--primary-color--100)' } }}
              name="trace"
              data={data}
              bubbleProperty="z"
              maxBubbleSize={25}
              minBubbleSize={5}
              size={1}
            />
          </Chart>
        </div>
      </CardBody>
    </Card>
  );
};

export default JaegerTracesChart;
