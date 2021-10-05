import React, { useRef } from 'react';
import { ResponsivePieCanvas } from '@nivo/pie';
import { SquareIcon } from '@patternfly/react-icons';
import { TooltipWrapper } from '@nivo/tooltip';

import { COLOR_SCALE } from '../../utils/colors';
import { IVisualizationData } from '../../utils/interfaces';
import { useDimensions } from '@kobsio/plugin-core';

interface IVisualizationChartPieProps {
  operation: string;
  data: IVisualizationData[];
}

const VisualizationChartPie: React.FunctionComponent<IVisualizationChartPieProps> = ({
  operation,
  data,
}: IVisualizationChartPieProps) => {
  const refChartContainer = useRef<HTMLDivElement>(null);
  const chartContainerSize = useDimensions(refChartContainer);

  return (
    <div ref={refChartContainer} style={{ height: '100%', width: '100%' }}>
      <div style={{ height: `${chartContainerSize.height}px`, width: '100%' }}>
        <ResponsivePieCanvas
          arcLabelsSkipAngle={10}
          arcLabelsTextColor="#151515"
          arcLinkLabelsColor={{ from: 'color' }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#151515"
          arcLinkLabelsThickness={2}
          borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          borderWidth={0}
          colors={COLOR_SCALE}
          data={data}
          id="label"
          innerRadius={0}
          isInteractive={true}
          margin={{ bottom: 25, left: 25, right: 25, top: 25 }}
          theme={{
            background: '#ffffff',
            fontFamily: 'RedHatDisplay, Overpass, overpass, helvetica, arial, sans-serif',
            fontSize: 10,
            textColor: '#000000',
          }}
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          tooltip={(tooltip) => {
            return (
              <TooltipWrapper anchor="right" position={[0, 5]}>
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
                    <SquareIcon color={tooltip.datum.color} /> {tooltip.datum.label}: {tooltip.datum.value}
                  </div>
                </div>
              </TooltipWrapper>
            );
          }}
          value="value"
        />
      </div>
    </div>
  );
};

export default VisualizationChartPie;
