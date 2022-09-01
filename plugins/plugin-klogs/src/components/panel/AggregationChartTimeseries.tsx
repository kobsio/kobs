import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartBar,
  ChartGroup,
  ChartLegendTooltip,
  ChartLine,
  ChartThemeColor,
  createContainer,
} from '@patternfly/react-charts';
import React, { useRef } from 'react';

import { IAggregationData, ISeriesDatum } from '../../utils/interfaces';
import {
  ITimes,
  chartAxisStyle,
  chartFormatLabel,
  chartTickFormatDate,
  formatTime,
  useDimensions,
} from '@kobsio/shared';
import { convertToTimeseriesChartData } from '../../utils/aggregation';

interface IAggregationChartTimeseriesProps {
  data: IAggregationData;
  type: 'line' | 'area' | 'bar';
  filters: string[];
  times: ITimes;
}

const AggregationChartTimeseries: React.FunctionComponent<IAggregationChartTimeseriesProps> = ({
  data,
  type,
  filters,
  times,
}: IAggregationChartTimeseriesProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  const series = convertToTimeseriesChartData(data, filters);

  const legendData = series.map((serie) => {
    return { childName: serie.name, name: serie.name };
  });

  const chartData = series.map((serie) =>
    type === 'area' ? (
      <ChartArea key={serie.name} data={serie.data} name={serie.name} interpolation="monotoneX" />
    ) : type === 'bar' ? (
      <ChartBar key={serie.name} data={serie.data} name={serie.name} />
    ) : (
      <ChartLine key={serie.name} data={serie.data} name={serie.name} interpolation="monotoneX" />
    ),
  );

  const CursorVoronoiContainer = createContainer('voronoi', 'cursor');

  return (
    <div style={{ height: '100%', width: '100%' }} ref={refChart}>
      <Chart
        containerComponent={
          <CursorVoronoiContainer
            cursorDimension="x"
            labels={({ datum }: { datum: ISeriesDatum }): string => chartFormatLabel(datum.y ? `${datum.y}` : '')}
            labelComponent={
              <ChartLegendTooltip
                themeColor={ChartThemeColor.multiOrdered}
                legendData={legendData}
                title={(datum: ISeriesDatum): string => formatTime(Math.floor((datum.x as Date).getTime() / 1000))}
              />
            }
            mouseFollowTooltips={true}
            voronoiDimension="x"
            voronoiPadding={0}
          />
        }
        height={chartSize.height}
        padding={{ bottom: 20, left: 50, right: 0, top: 0 }}
        scale={{ x: 'time', y: 'linear' }}
        themeColor={ChartThemeColor.multiOrdered}
        width={chartSize.width}
        domain={{ x: [new Date(times.timeStart * 1000), new Date(times.timeEnd * 1000)] }}
      >
        <ChartAxis dependentAxis={false} tickFormat={chartTickFormatDate} showGrid={true} style={chartAxisStyle} />
        <ChartAxis dependentAxis={true} showGrid={true} style={chartAxisStyle} />

        <ChartGroup>{chartData}</ChartGroup>
      </Chart>
    </div>
  );
};

export default AggregationChartTimeseries;
