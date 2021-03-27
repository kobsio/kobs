import { Card, CardActions, CardBody, CardHeader, CardHeaderMain } from '@patternfly/react-core';
import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartLegendTooltip,
  ChartThemeColor,
  createContainer,
} from '@patternfly/react-charts';
import React, { useEffect, useRef, useState } from 'react';

import { Bucket } from 'proto/elasticsearch_grpc_web_pb';
import ElasticsearchLogsBucketsAction from 'plugins/elasticsearch/ElasticsearchLogsBucketsAction';
import { formatTime } from 'utils/helpers';

interface ILabels {
  datum: Bucket.AsObject;
}

export interface IElasticsearchLogsBucketsProps {
  name: string;
  queryName: string;
  buckets: Bucket.AsObject[];
  fields: string[];
  hits: number;
  query: string;
  timeEnd: number;
  timeStart: number;
  took: number;
}

// ElasticsearchLogsBuckets renders a bar chart with the distribution of the number of logs accross the selected time
// range.
const ElasticsearchLogsBuckets: React.FunctionComponent<IElasticsearchLogsBucketsProps> = ({
  name,
  queryName,
  buckets,
  fields,
  hits,
  query,
  timeEnd,
  timeStart,
  took,
}: IElasticsearchLogsBucketsProps) => {
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
      {queryName ? (
        <CardHeader>
          <CardHeaderMain>
            {queryName} ({hits} Documents in {took} Milliseconds)
          </CardHeaderMain>
          <CardActions>
            <ElasticsearchLogsBucketsAction
              name={name}
              query={query}
              fields={fields}
              timeEnd={timeEnd}
              timeStart={timeStart}
            />
          </CardActions>
        </CardHeader>
      ) : (
        <CardHeader className="pf-u-text-align-center">
          <CardHeaderMain style={{ width: '100%' }}>
            {hits} Documents in {took} Milliseconds
          </CardHeaderMain>
        </CardHeader>
      )}
      <CardBody>
        {buckets.length > 0 ? (
          <div style={{ height: '200px', width: '100%' }} ref={refChart}>
            <Chart
              containerComponent={
                <CursorVoronoiContainer
                  cursorDimension="x"
                  labels={({ datum }: ILabels): string => `${datum.y}`}
                  labelComponent={
                    <ChartLegendTooltip
                      legendData={legendData}
                      title={(point: Bucket.AsObject): string => formatTime(Math.floor(point.x / 1000))}
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
        ) : null}
      </CardBody>
    </Card>
  );
};

export default ElasticsearchLogsBuckets;
