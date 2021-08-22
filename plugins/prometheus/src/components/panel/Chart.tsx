import { ResponsiveLineCanvas, Serie } from '@nivo/line';
import React from 'react';
import { ScaleSpec } from '@nivo/scales';
import { SquareIcon } from '@patternfly/react-icons';
import { TooltipWrapper } from '@nivo/tooltip';

import { ILabels, IPanelOptions, IYAxis } from '../../utils/interfaces';
import { COLOR_SCALE } from '../../utils/colors';
import { formatAxisBottom } from '../../utils/helpers';

const getYScale = (yAxis: IYAxis | undefined, stacked: boolean | undefined, min: number, max: number): ScaleSpec => {
  let minValue: number | 'auto' = 'auto';
  let maxValue: number | 'auto' = 'auto';

  if (yAxis) {
    if (yAxis.min && yAxis.min === 'min') {
      minValue = min;
    } else if (yAxis.min && typeof yAxis.min === 'number') {
      minValue = yAxis.min;
    }

    if (yAxis.max && yAxis.max === 'max') {
      maxValue = max;
    } else if (yAxis.max && typeof yAxis.max === 'number') {
      maxValue = yAxis.max;
    }
  }

  return { max: maxValue, min: minValue, stacked: stacked, type: 'linear' };
};

interface IChartProps {
  startTime: number;
  endTime: number;
  min: number;
  max: number;
  options: IPanelOptions;
  labels: ILabels;
  series: Serie[];
}

// The Chart component is responsible for rendering the chart for all the metrics, which were returned for the users
// specified queries.
export const Chart: React.FunctionComponent<IChartProps> = ({
  startTime,
  endTime,
  min,
  max,
  options,
  labels,
  series,
}: IChartProps) => {
  return (
    <ResponsiveLineCanvas
      axisBottom={{
        format: formatAxisBottom(startTime, endTime),
      }}
      axisLeft={{
        format: '>-.2f',
        legend: options.unit,
        legendOffset: -40,
        legendPosition: 'middle',
      }}
      colors={COLOR_SCALE}
      curve="monotoneX"
      data={series}
      enableArea={options.type === 'area'}
      enableGridX={false}
      enableGridY={true}
      enablePoints={false}
      xFormat="time:%Y-%m-%d %H:%M:%S"
      lineWidth={1}
      margin={{ bottom: 25, left: 50, right: 0, top: 0 }}
      theme={{
        background: '#ffffff',
        fontFamily: 'RedHatDisplay, Overpass, overpass, helvetica, arial, sans-serif',
        fontSize: 10,
        textColor: '#000000',
      }}
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      tooltip={(tooltip) => {
        const isFirstHalf = new Date(tooltip.point.data.x).getTime() < (endTime + startTime) / 2;

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
                <b>{tooltip.point.data.xFormatted}</b>
              </div>
              <div>
                <SquareIcon color={tooltip.point.color} /> {labels[tooltip.point.id.split('.')[0]]}:{' '}
                {tooltip.point.data.yFormatted} {options.unit}
              </div>
            </div>
          </TooltipWrapper>
        );
      }}
      xScale={{ max: new Date(endTime), min: new Date(startTime), type: 'time' }}
      yScale={getYScale(options.yAxis, options.stacked, min, max)}
      yFormat=" >-.4f"
    />
  );
};

export default Chart;
