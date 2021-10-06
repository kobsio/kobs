import { BarDatum, ResponsiveBarCanvas } from '@nivo/bar';
import React, { useRef } from 'react';

import { CHART_THEME, COLOR_SCALE, ChartTooltip, useDimensions } from '@kobsio/plugin-core';
import { IVisualizationData } from '../../utils/interfaces';

interface IVisualizationChartBarProps {
  data: IVisualizationData[];
}

const VisualizationChartBar: React.FunctionComponent<IVisualizationChartBarProps> = ({
  data,
}: IVisualizationChartBarProps) => {
  const refChartContainer = useRef<HTMLDivElement>(null);
  const chartContainerSize = useDimensions(refChartContainer);

  const barData: BarDatum[] = data.map((datum) => {
    return {
      label: datum.label,
      value: datum.value,
    };
  });

  return (
    <div ref={refChartContainer} style={{ height: '100%', minHeight: '500px', width: '100%' }}>
      <div style={{ height: `${chartContainerSize.height}px`, width: '100%' }}>
        <ResponsiveBarCanvas
          axisLeft={{
            format: '>-.0s',
            legend: '',
            legendOffset: -40,
            legendPosition: 'middle',
          }}
          axisBottom={{
            legend: '',
            tickRotation: 45,
          }}
          borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          borderRadius={0}
          borderWidth={0}
          colorBy="indexValue"
          colors={COLOR_SCALE}
          data={barData}
          enableLabel={false}
          enableGridX={false}
          enableGridY={true}
          groupMode="stacked"
          indexBy="label"
          indexScale={{ round: true, type: 'band' }}
          isInteractive={true}
          keys={['value']}
          layout="vertical"
          margin={{ bottom: 100, left: 50, right: 0, top: 0 }}
          maxValue="auto"
          minValue="auto"
          reverse={false}
          theme={CHART_THEME}
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          tooltip={(tooltip) => {
            const isFirstHalf = tooltip.index < barData.length / 2;

            return (
              <ChartTooltip
                anchor={isFirstHalf ? 'right' : 'left'}
                color={tooltip.color}
                label={`${tooltip.data.label}: ${tooltip.data.value}`}
                position={[0, 5]}
              />
            );
          }}
          valueFormat=""
          valueScale={{ type: 'linear' }}
        />
      </div>
    </div>
  );
};

export default VisualizationChartBar;
