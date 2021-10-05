import { BarDatum, ResponsiveBarCanvas } from '@nivo/bar';
import React, { useRef } from 'react';
import { SquareIcon } from '@patternfly/react-icons';
import { TooltipWrapper } from '@nivo/tooltip';

import { COLOR_SCALE } from '../../utils/colors';
import { IVisualizationData } from '../../utils/interfaces';
import { useDimensions } from '@kobsio/plugin-core';

interface IVisualizationChartBarProps {
  operation: string;
  data: IVisualizationData[];
}

const VisualizationChartBar: React.FunctionComponent<IVisualizationChartBarProps> = ({
  operation,
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
    <div ref={refChartContainer} style={{ height: '100%', width: '100%' }}>
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
          theme={{
            background: '#ffffff',
            fontFamily: 'RedHatDisplay, Overpass, overpass, helvetica, arial, sans-serif',
            fontSize: 10,
            textColor: '#000000',
          }}
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          tooltip={(tooltip) => {
            const isFirstHalf = tooltip.index < barData.length / 2;

            return (
              <TooltipWrapper anchor={isFirstHalf ? 'right' : 'left'} position={[0, 5]}>
                <div
                  style={{
                    background: '#151515',
                    color: '#f0f0f0',
                    fontFamily: '"RedHatText", "Overpass", overpass, helvetica, arial, sans-serif',
                    fontSize: '14px',
                    padding: '8px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div>
                    <SquareIcon color={tooltip.color} /> {tooltip.data.label}: {tooltip.data.value}
                  </div>
                </div>
              </TooltipWrapper>
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
