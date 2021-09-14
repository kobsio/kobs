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

  return (
    <div style={{ height: '250px' }}>
      <ResponsiveBarCanvas
        axisBottom={{
          legend: '',
          tickValues: buckets.filter((bucket, index) => index % 2 === 0).map((bucket) => bucket.time),
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
        data={buckets}
        enableLabel={false}
        enableGridX={false}
        enableGridY={true}
        groupMode="stacked"
        indexBy="time"
        indexScale={{ round: true, type: 'band' }}
        isInteractive={true}
        keys={['documents']}
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
          const isFirstHalf = tooltip.index < buckets.length / 2;

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
                  <b>{tooltip.data.time}</b>
                </div>
                <div>
                  <SquareIcon color="#0066cc" /> Documents: {tooltip.data.documents}
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
