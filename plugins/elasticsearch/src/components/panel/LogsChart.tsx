import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartLegendTooltip,
  ChartThemeColor,
  createContainer,
} from '@patternfly/react-charts';
import React, { useRef } from 'react';

import { IBucket, IDatum, IDomain, ILabel } from '../../utils/interfaces';
import { IPluginTimes, formatTime, useDimensions } from '@kobsio/plugin-core';

interface ILogsChartProps {
  buckets?: IBucket[];
  changeTime?: (times: IPluginTimes) => void;
}

const LogsChart: React.FunctionComponent<ILogsChartProps> = ({ buckets, changeTime }: ILogsChartProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart, { height: 1, width: 1 });

  const data: IDatum[] =
    !buckets || buckets.length === 0
      ? []
      : buckets.map((bucket) => {
          return {
            x: new Date(bucket.key),
            y: bucket.doc_count,
          };
        });

  const CursorVoronoiContainer = createContainer('voronoi', 'brush');
  const legendData = [{ childName: 'count', name: 'Document Count' }];

  return (
    <div style={{ height: '250px', width: '100%' }} ref={refChart}>
      <Chart
        containerComponent={
          <CursorVoronoiContainer
            cursorDimension="x"
            brushDimension="x"
            labels={({ datum }: ILabel): string => `${datum.y}`}
            labelComponent={
              <ChartLegendTooltip
                legendData={legendData}
                title={(datum: IDatum): string =>
                  data.length > 0 ? formatTime(Math.floor(datum.x.getTime() / 1000)) : ''
                }
              />
            }
            mouseFollowTooltips={true}
            onBrushDomainChangeEnd={(domain: IDomain): void => {
              if (changeTime && domain.x.length === 2) {
                changeTime({
                  timeEnd: Math.floor(domain.x[1].getTime() / 1000),
                  timeStart: Math.floor(domain.x[0].getTime() / 1000),
                });
              }
            }}
            voronoiDimension="x"
            voronoiPadding={0}
          />
        }
        height={chartSize.height}
        padding={{ bottom: 20, left: 0, right: 0, top: 0 }}
        scale={{ x: 'time', y: 'linear' }}
        themeColor={ChartThemeColor.multiOrdered}
        width={chartSize.width}
      >
        <ChartAxis
          dependentAxis={false}
          tickValues={data
            .filter((datum, index) => index !== 0 && index !== data.length - 1 && (index + 1) % 2 === 0)
            .map((datum) => datum.x)}
          tickFormat={(tick: Date): string =>
            `${('0' + (tick.getMonth() + 1)).slice(-2)}-${('0' + tick.getDate()).slice(-2)} ${(
              '0' + tick.getHours()
            ).slice(-2)}:${('0' + tick.getMinutes()).slice(-2)}:${('0' + tick.getSeconds()).slice(-2)}`
          }
          showGrid={false}
          style={{
            tickLabels: {
              fontFamily: 'RedHatDisplay, Overpass, overpass, helvetica, arial, sans-serif',
              fontSize: 10,
              fontWeight: 'bold',
              padding: 5,
            },
          }}
        />
        <ChartBar data={data} name="count" barWidth={data && chartSize.width / data.length} />
      </Chart>
    </div>
  );
};

export default LogsChart;
