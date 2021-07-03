import { ResponsiveLineCanvas, Serie } from '@nivo/line';
import React from 'react';
import { SquareIcon } from '@patternfly/react-icons';

import { ILabels, IPanelOptions } from '../../utils/interfaces';
import { COLOR_SCALE } from '../../utils/colors';
import { IPluginTimes } from '@kobsio/plugin-core';
import { formatAxisBottom } from '../../utils/helpers';

interface IChartProps {
  times: IPluginTimes;
  options: IPanelOptions;
  labels: ILabels;
  series: Serie[];
}

// The Chart component is responsible for rendering the chart for all the metrics, which were returned for the users
// specified queries.
export const Chart: React.FunctionComponent<IChartProps> = ({ times, options, labels, series }: IChartProps) => {
  return (
    <ResponsiveLineCanvas
      axisBottom={{
        format: formatAxisBottom(times),
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
            <b>{tooltip.point.data.xFormatted}</b>
          </div>
          <div>
            <SquareIcon color={tooltip.point.color} /> {labels[tooltip.point.id.split('.')[0]]}:{' '}
            {tooltip.point.data.yFormatted} {options.unit}
          </div>
        </div>
      )}
      xScale={{ type: 'time' }}
      yScale={{ stacked: options.stacked, type: 'linear' }}
      yFormat=" >-.2f"
    />
  );
};

export default Chart;
