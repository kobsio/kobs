import { chartTheme, chartTickFormatTime, getChartColor, useDimensions } from '@kobsio/core';
import { Box, useTheme } from '@mui/material';
import { FunctionComponent, useRef } from 'react';
import {
  createContainer,
  DomainTuple,
  VictoryAxis,
  VictoryBar,
  VictoryBrushContainerProps,
  VictoryChart,
  VictoryThemeDefinition,
  VictoryVoronoiContainerProps,
} from 'victory';

export interface IChangeTimeframePayload {
  timeEnd: number;
  timeStart: number;
}

interface IBucket {
  count: number;
  interval: number;
}

interface ILogsBucketChart {
  buckets: IBucket[];
  onChangeTimeframe: (payload: IChangeTimeframePayload) => void;
}

const BrushVoronoiContainer = createContainer<VictoryVoronoiContainerProps, VictoryBrushContainerProps>(
  'voronoi',
  'brush',
);

/**
 * utility for creating a bar chart theme from the base Theme definition
 */
const fromBaseTheme = (base: VictoryThemeDefinition): VictoryThemeDefinition => {
  return {
    ...base,
    axis: {
      ...base.axis,
      style: {
        ...base.axis?.style,
        grid: { stroke: 'transparent' },
        tickLabels: {
          ...base.axis?.style?.tickLabels,
          padding: 2,
        },
      },
    },
    bar: {
      style: {
        data: {
          fill: getChartColor(0),
          stroke: 0,
        },
      },
    },
  };
};

// utility for creating horizontal padding for the time-series
const getDomain = (x: number[], y: number[]) => {
  let bucketWidth = 0;
  if (x.length > 1) {
    bucketWidth = x[1] - x[0];
  }
  const xmin = x[0] - bucketWidth;
  const xmax = x[x.length - 1] + bucketWidth;
  const ymax = Math.max(...y);

  return {
    x: [xmin, xmax] as DomainTuple,
    y: [0, ymax] as DomainTuple,
  };
};

/**
 * LogsBucketChart renders a bar chart of the given buckets in a time-series format
 * the chart supports a horizontal zoom, which triggers the callback `onChangeTimeframe`
 */
const LogsBucketChart: FunctionComponent<ILogsBucketChart> = ({ buckets, onChangeTimeframe }) => {
  const x = buckets.map((b) => b.interval * 1000);
  const y = buckets.map((b) => b.count);

  const muiTheme = useTheme();
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);
  const data = buckets.map((p, i) => ({
    x: new Date(p.interval * 1000),
    y: p.count,
  }));

  const theme = fromBaseTheme(chartTheme(muiTheme));

  return (
    <Box sx={{ height: '100%', width: '100%' }} ref={refChart}>
      <VictoryChart
        containerComponent={
          <BrushVoronoiContainer
            brushDimension="x"
            labels={() => ''}
            mouseFollowTooltips={true}
            defaultBrushArea="none"
            brushDomain={{ x: [0, 0] }}
            voronoiDimension="x"
            voronoiPadding={0}
            onBrushDomainChangeEnd={(domain) => {
              if (domain.x.length !== 2) {
                return;
              }

              const left = new Date(domain.x[0]);
              const right = new Date(domain.x[1]);

              const timeEnd = Math.floor(right.getTime() / 1000);
              const timeStart = Math.floor(left.getTime() / 1000);

              if (timeEnd - timeStart >= 1) {
                onChangeTimeframe({
                  timeEnd: timeEnd,
                  timeStart: timeStart,
                });
              }
            }}
          />
        }
        padding={{ bottom: 25, left: 20, right: 20, top: 0 }}
        scale={{ x: 'time', y: 'linear' }}
        theme={theme}
        width={chartSize.width}
        height={chartSize.height}
        domain={getDomain(x, y)}
      >
        <VictoryAxis dependentAxis={false} tickFormat={chartTickFormatTime} />
        <VictoryBar data={data} name="count" barWidth={data && chartSize.width / data.length - 8} />
      </VictoryChart>
    </Box>
  );
};

export default LogsBucketChart;
