import { Card, CardBody } from '@patternfly/react-core';
import { Datum, ResponsiveScatterPlotCanvas, Serie } from '@nivo/scatterplot';
import React from 'react';
import { SquareIcon } from '@patternfly/react-icons';

import { getDuration, getRootSpan } from '../../utils/helpers';
import { ITrace } from '../../utils/interfaces';

interface IDatum extends Datum {
  label: string;
  size: number;
}

interface ITracesChartProps {
  traces: ITrace[];
}

const TracesChart: React.FunctionComponent<ITracesChartProps> = ({ traces }: ITracesChartProps) => {
  let min = 0;
  let max = 0;
  const data: IDatum[] = [];

  for (let i = 0; i < traces.length; i++) {
    if (i === 0) {
      min = traces[i].spans.length;
      max = traces[i].spans.length;
    }

    if (traces[i].spans.length < min) {
      min = traces[i].spans.length;
    }

    if (traces[i].spans.length > min) {
      max = traces[i].spans.length;
    }

    const rootSpan = getRootSpan(traces[i].spans);
    if (!rootSpan) {
      data.push({
        label: `${traces[i].traceID}`,
        size: traces[i].spans.length,
        x: new Date(Math.floor(traces[i].spans[0].startTime / 1000)),
        y: getDuration(traces[i].spans),
      });
    } else {
      const rootSpanProcess = traces[i].processes[rootSpan.processID];
      const rootSpanService = rootSpanProcess.serviceName;

      data.push({
        label: `${rootSpanService}: ${rootSpan.operationName}`,
        size: traces[i].spans.length,
        x: new Date(Math.floor(traces[i].spans[0].startTime / 1000)),
        y: getDuration(traces[i].spans),
      });
    }
  }

  const series: Serie[] = [
    {
      data: data,
      id: 'Traces',
    },
  ];

  return (
    <Card isCompact={true}>
      <CardBody>
        <div style={{ height: '250px' }}>
          <ResponsiveScatterPlotCanvas
            axisBottom={{
              format: '%H:%M:%S',
            }}
            axisLeft={null}
            axisRight={null}
            axisTop={null}
            colors={['#0066cc']}
            data={series}
            enableGridX={false}
            enableGridY={false}
            margin={{ bottom: 25, left: 0, right: 0, top: 0 }}
            nodeSize={{ key: 'size', sizes: [15, 20], values: [min, max] }}
            theme={{
              background: '#ffffff',
              fontFamily: 'RedHatDisplay, Overpass, overpass, helvetica, arial, sans-serif',
              fontSize: 10,
              textColor: '#000000',
            }}
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            tooltip={(tooltip) => (
              <div
                className="pf-u-box-shadow-sm"
                style={{
                  background: '#ffffff',
                  fontSize: '12px',
                  padding: '12px',
                }}
              >
                <div>
                  <b>{tooltip.node.data.formattedX}</b>
                </div>
                <div>
                  <SquareIcon color="#0066cc" /> {(tooltip.node.data as unknown as IDatum).label}{' '}
                  {tooltip.node.data.formattedY}
                </div>
              </div>
            )}
            xFormat="time:%Y-%m-%d %H:%M:%S.%L"
            xScale={{ type: 'time' }}
            yFormat={(e): string => e + ' ms'}
            yScale={{ max: 'auto', min: 'auto', type: 'linear' }}
          />
        </div>
      </CardBody>
    </Card>
  );
};

export default TracesChart;
