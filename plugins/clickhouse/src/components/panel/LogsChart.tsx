import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartLegendTooltip,
  ChartThemeColor,
  createContainer,
} from '@patternfly/react-charts';
import React, { useEffect, useRef, useState } from 'react';

import { IBucket, IDatum, IDomain, ILabel } from '../../utils/interfaces';
import { IPluginTimes, formatTime } from '@kobsio/plugin-core';

interface ILogsChartProps {
  buckets?: IBucket[];
  changeTime?: (times: IPluginTimes) => void;
}

const LogsChart: React.FunctionComponent<ILogsChartProps> = ({ buckets, changeTime }: ILogsChartProps) => {
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

  const data: IDatum[] | undefined =
    !buckets || buckets.length === 0
      ? undefined
      : buckets.map((bucket) => {
          return {
            x: new Date(bucket.interval * 1000),
            y: bucket.count,
          };
        });

  if (!data) {
    return <div style={{ height: '250px' }}></div>;
  }

  const CursorVoronoiContainer = changeTime
    ? createContainer('voronoi', 'brush')
    : createContainer('voronoi', 'cursor');
  const legendData = [{ childName: 'count', name: 'Document Count' }];

  return (
    <div style={{ height: '250px' }} ref={refChart}>
      <Chart
        containerComponent={
          <CursorVoronoiContainer
            cursorDimension="x"
            brushDimension="x"
            labels={({ datum }: ILabel): string => `${datum.y}`}
            labelComponent={
              <ChartLegendTooltip
                legendData={legendData}
                title={(datum: IDatum): string => formatTime(Math.floor(datum.x.getTime() / 1000))}
              />
            }
            mouseFollowTooltips={true}
            onBrushDomainChangeEnd={(domain: IDomain): void => {
              if (changeTime && domain.x.length === 2) {
                changeTime({
                  time: 'custom',
                  timeEnd: Math.floor(domain.x[1].getTime() / 1000),
                  timeStart: Math.floor(domain.x[0].getTime() / 1000),
                });
              }
            }}
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
        <ChartAxis
          dependentAxis={false}
          tickFormat={(tick: Date): string =>
            `${('0' + (tick.getMonth() + 1)).slice(-2)}-${('0' + tick.getDate()).slice(-2)} ${(
              '0' + tick.getHours()
            ).slice(-2)}:${('0' + tick.getMinutes()).slice(-2)}:${('0' + tick.getSeconds()).slice(-2)}`
          }
          showGrid={false}
        />
        <ChartBar data={data} name="count" barWidth={width / data.length} />
      </Chart>
    </div>
  );
};

export default LogsChart;
