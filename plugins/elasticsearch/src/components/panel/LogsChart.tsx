import React from 'react';
import { ResponsiveBarCanvas } from '@nivo/bar';

import { IBucket } from '../../utils/interfaces';

interface ILogsChartProps {
  buckets: IBucket[];
}

const LogsChart: React.FunctionComponent<ILogsChartProps> = ({ buckets }: ILogsChartProps) => {
  return (
    <div style={{ height: '250px' }}>
      <ResponsiveBarCanvas
        axisBottom={{
          legend: '',
          tickValues: 5,
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
        keys={['Documents']}
        layout="vertical"
        margin={{ bottom: 25, left: 50, right: 0, top: 0 }}
        maxValue="auto"
        minValue="auto"
        reverse={false}
        valueFormat=""
        valueScale={{ type: 'linear' }}
      />
    </div>
  );
};

export default LogsChart;
