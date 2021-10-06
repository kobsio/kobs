import React, { useRef } from 'react';
import { ResponsivePieCanvas } from '@nivo/pie';

import { CHART_THEME, COLOR_SCALE, ChartTooltip, useDimensions } from '@kobsio/plugin-core';
import { IVisualizationData } from '../../utils/interfaces';

interface IVisualizationChartPieProps {
  data: IVisualizationData[];
}

const VisualizationChartPie: React.FunctionComponent<IVisualizationChartPieProps> = ({
  data,
}: IVisualizationChartPieProps) => {
  const refChartContainer = useRef<HTMLDivElement>(null);
  const chartContainerSize = useDimensions(refChartContainer);

  return (
    <div ref={refChartContainer} style={{ height: '100%', minHeight: '500px', width: '100%' }}>
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
          theme={CHART_THEME}
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          tooltip={(tooltip) => {
            return (
              <ChartTooltip
                anchor="right"
                color={tooltip.datum.color}
                label={`${tooltip.datum.label}: ${tooltip.datum.value}`}
                position={[0, 5]}
              />
            );
          }}
          value="value"
        />
      </div>
    </div>
  );
};

export default VisualizationChartPie;
