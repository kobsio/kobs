import { Card, CardBody } from '@patternfly/react-core';
import { Chart, ChartAxis, ChartScatter, ChartThemeColor, ChartVoronoiContainer } from '@patternfly/react-charts';
import React, { useMemo, useRef } from 'react';
import Trace from './details/Trace';

import { IPluginInstance, chartAxisStyle, chartFormatLabel, useDimensions } from '@kobsio/shared';
import { doesTraceContainsError, formatTraceTime } from '../../utils/helpers';
import { ITrace } from '../../utils/interfaces';

interface IDatum {
  hasError: boolean;
  name: string;
  trace: ITrace;
  x: Date;
  y: number;
  z: number;
}

interface ITracesChartProps {
  instance: IPluginInstance;
  traces: ITrace[];
  setDetails?: (details: React.ReactNode) => void;
}

const TracesChart: React.FunctionComponent<ITracesChartProps> = ({
  instance,
  traces,
  setDetails,
}: ITracesChartProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  const { data } = useMemo<{ data: IDatum[] }>(() => {
    const result: IDatum[] = [];

    traces.forEach((trace, index) => {
      result.push({
        hasError: doesTraceContainsError(trace),
        name: trace.traceName,
        trace: trace,
        x: new Date(Math.floor(trace.spans[0].startTime / 1000)),
        y: trace.duration / 1000,
        z: trace.spans.length,
      });
    });

    return {
      data: result.sort((a, b) => (a.x.valueOf() as number) - (b.x.valueOf() as number)),
    };
  }, [traces]);

  return (
    <Card isCompact={true}>
      <CardBody>
        <div style={{ height: '250px' }} ref={refChart}>
          <Chart
            containerComponent={
              <ChartVoronoiContainer
                labels={({ datum }: { datum: IDatum }): string =>
                  chartFormatLabel(`${formatTraceTime(datum.x.getTime() * 1000)}\n${datum.name}: ${datum.y}ms`)
                }
                constrainToVisibleArea={true}
              />
            }
            height={chartSize.height}
            padding={{ bottom: 20, left: 50, right: 0, top: 0 }}
            scale={{ x: 'time', y: 'linear' }}
            themeColor={ChartThemeColor.multiOrdered}
            width={chartSize.width}
          >
            <ChartAxis
              dependentAxis={true}
              showGrid={false}
              style={chartAxisStyle}
              tickFormat={(tick: number): string => `${tick}ms`}
            />
            <ChartAxis dependentAxis={false} showGrid={false} style={chartAxisStyle} />
            <ChartScatter
              style={{
                data: {
                  fill: ({ datum }) =>
                    datum.hasError ? 'var(--pf-global--danger-color--100)' : 'var(--pf-global--primary-color--100)',
                },
              }}
              events={[
                {
                  eventHandlers: {
                    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
                    onClick: () => {
                      return [
                        {
                          mutation: ({ datum }: { datum: IDatum }): void => {
                            if (setDetails && datum) {
                              setDetails(
                                <Trace
                                  instance={instance}
                                  trace={datum.trace}
                                  close={(): void => setDetails(undefined)}
                                />,
                              );
                            }
                          },
                          target: 'data',
                        },
                      ];
                    },
                  },
                  target: 'data',
                },
              ]}
              data={data}
              bubbleProperty="z"
              maxBubbleSize={25}
              minBubbleSize={10}
              size={1}
            />
          </Chart>
        </div>
      </CardBody>
    </Card>
  );
};

export default TracesChart;
