import { BarDatum, ResponsiveBarCanvas } from '@nivo/bar';
import React from 'react';

import { CHART_THEME } from '@kobsio/plugin-core';

interface INodeChartProps {
  data: BarDatum[];
  legend: string;
}

const NodeChart: React.FunctionComponent<INodeChartProps> = ({ data, legend }: INodeChartProps) => {
  return (
    <div style={{ height: `${50 * data.length}px` }}>
      <ResponsiveBarCanvas
        axisBottom={{
          legend: legend,
          legendOffset: 30,
          legendPosition: 'middle',
        }}
        axisLeft={{
          legend: '',
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
        indexBy="name"
        indexScale={{ round: true, type: 'band' }}
        isInteractive={false}
        keys={['value']}
        layout="horizontal"
        margin={{ bottom: 40, left: 50, right: 0, top: 0 }}
        maxValue="auto"
        minValue="auto"
        reverse={false}
        theme={CHART_THEME}
        valueFormat=""
        valueScale={{ type: 'linear' }}
      />
    </div>
  );
};

export default NodeChart;
