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
import {
  ITimes,
  chartAxisStyle,
  chartFormatLabel,
  chartTickFormatDate,
  formatTime,
  useDimensions,
} from '@kobsio/shared';

interface ILogsChartProps {
  buckets?: IBucket[];
  changeTime?: (times: ITimes) => void;
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
            labels={({ datum }: ILabel): string => chartFormatLabel(`${datum.y}`)}
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
          tickFormat={chartTickFormatDate}
          showGrid={false}
          style={chartAxisStyle}
        />
        <ChartBar data={data} name="count" barWidth={data && chartSize.width / data.length} />
      </Chart>
    </div>
  );
};

export default LogsChart;