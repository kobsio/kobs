import React from 'react';
import { ResponsiveBarCanvas } from '@nivo/bar';
import { SquareIcon } from '@patternfly/react-icons';
import { TooltipWrapper } from '@nivo/tooltip';

import { IBucket } from '../../utils/interfaces';

interface ILogsChartProps {
  buckets?: IBucket[];
}

const LogsChart: React.FunctionComponent<ILogsChartProps> = ({ buckets }: ILogsChartProps) => {
  if (!buckets || buckets.length === 0) {
    return <div style={{ height: '250px' }}></div>;
  }

  const data: IBucket[] = buckets.map((bucket) => {
    const d = new Date(bucket.interval * 1000);

    return {
      count: bucket.count,
      interval: bucket.interval,
      intervalFormatted: `${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)} ${(
        '0' + d.getHours()
      ).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}:${('0' + d.getSeconds()).slice(-2)}`,
    };
  });

  return (
    <div style={{ height: '250px' }}>
      <ResponsiveBarCanvas
        axisBottom={{
          legend: '',
          tickValues: data.filter((bucket, index) => index % 2 === 0).map((bucket) => bucket.intervalFormatted),
        }}
        axisLeft={{
          format: '>-.0s',
          legend: 'Count',
          legendOffset: -40,
          legendPosition: 'middle',
        }}
        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        borderRadius={0}
        borderWidth={0}
        colorBy="id"
        colors={['#0066cc']}
        data={data}
        enableLabel={false}
        enableGridX={false}
        enableGridY={true}
        groupMode="stacked"
        indexBy="intervalFormatted"
        indexScale={{ round: true, type: 'band' }}
        isInteractive={true}
        keys={['count']}
        layout="vertical"
        margin={{ bottom: 25, left: 50, right: 0, top: 0 }}
        maxValue="auto"
        minValue="auto"
        reverse={false}
        theme={{
          background: '#ffffff',
          fontFamily: 'RedHatDisplay, Overpass, overpass, helvetica, arial, sans-serif',
          fontSize: 10,
          textColor: '#000000',
        }}
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        tooltip={(tooltip) => {
          const isFirstHalf = tooltip.index < data.length / 2;

          return (
            <TooltipWrapper anchor={isFirstHalf ? 'right' : 'left'} position={[0, 20]}>
              <div
                className="pf-u-box-shadow-sm"
                style={{
                  background: '#ffffff',
                  fontSize: '12px',
                  padding: '12px',
                  whiteSpace: 'nowrap',
                }}
              >
                <div>
                  <b>{tooltip.data.intervalFormatted}</b>
                </div>
                <div>
                  <SquareIcon color="#0066cc" /> Documents: {tooltip.data.count}
                </div>
              </div>
            </TooltipWrapper>
          );
        }}
        valueFormat=""
        valueScale={{ type: 'linear' }}
      />
    </div>
  );
};

export default LogsChart;
