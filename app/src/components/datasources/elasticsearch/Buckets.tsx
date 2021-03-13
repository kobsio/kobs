import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartLegendTooltip,
  ChartThemeColor,
  createContainer,
} from '@patternfly/react-charts';
import React, { useEffect, useRef, useState } from 'react';

import { DatasourceLogsBucket } from 'generated/proto/datasources_pb';
import { formatTime } from 'utils/helpers';

interface ILabels {
  datum: DatasourceLogsBucket.AsObject;
}

export interface IBucketsProps {
  hits: number;
  took: number;
  buckets: DatasourceLogsBucket.AsObject[];
}

// Buckets renders a bar chart with the distribution of the number of logs accross the selected time range.
const Buckets: React.FunctionComponent<IBucketsProps> = ({ hits, took, buckets }: IBucketsProps) => {
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

  const CursorVoronoiContainer = createContainer('voronoi', 'cursor');
  const legendData = [{ childName: 'count', name: 'Number of Documents' }];

  return (
    <Card>
      <CardTitle className="pf-u-text-align-center">
        {hits} Documents in {took} Milliseconds
      </CardTitle>
      <CardBody>
        <div className="kobsio-chart-container-default-small" ref={refChart}>
          <Chart
            containerComponent={
              <CursorVoronoiContainer
                cursorDimension="x"
                labels={({ datum }: ILabels): string => `${datum.y}`}
                labelComponent={
                  <ChartLegendTooltip
                    legendData={legendData}
                    title={(point: DatasourceLogsBucket.AsObject): string => formatTime(Math.floor(point.x / 1000))}
                  />
                }
                mouseFollowTooltips
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
            <ChartBar data={buckets} name="count" barWidth={width / buckets.length} />
          </Chart>
        </div>
      </CardBody>
    </Card>
  );
};

export default Buckets;
