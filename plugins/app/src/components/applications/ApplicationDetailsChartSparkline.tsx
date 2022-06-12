import React from 'react';
import { ResponsiveLineCanvas } from '@nivo/line';

import { COLOR_SCALE, ITimes } from '@kobsio/shared';
import { getMappingValue, roundNumber, sparklineDataToSeries } from './utils/helpers';
import { IDatum } from './utils/interfaces';

interface IApplicationDetailsChartSparklineProps {
  title: string;
  data: IDatum[];
  unit?: string;
  mappings?: { [key: string]: string };
  times: ITimes;
}

const ApplicationDetailsChartSparkline: React.FunctionComponent<IApplicationDetailsChartSparklineProps> = ({
  title,
  data,
  unit,
  mappings,
  times,
}: IApplicationDetailsChartSparklineProps) => {
  // Determine the label which should be shown above the chart. This is the last value in first metric of the returned
  // data or a value from the user specified mappings.
  let label = 'N/A';
  if (data && data.length > 0) {
    if (mappings && Object.keys(mappings).length > 0) {
      label = getMappingValue(data[data.length - 1].y, mappings);
    } else {
      label =
        data[data.length - 1].y === null
          ? 'N/A'
          : `${roundNumber(data[data.length - 1].y as number)} ${unit ? unit : ''}`;
    }
  }

  return (
    <div>
      <div className="pf-u-font-size-lg pf-u-text-nowrap pf-u-text-truncate">{label}</div>
      <div className="pf-u-font-size-sm pf-u-color-400 pf-u-text-nowrap pf-u-text-truncate">{title}</div>
      <div style={{ height: '75px' }}>
        <ResponsiveLineCanvas
          colors={COLOR_SCALE[0]}
          curve="monotoneX"
          data={sparklineDataToSeries(data)}
          enableArea={true}
          enableGridX={false}
          enableGridY={false}
          enablePoints={false}
          isInteractive={false}
          lineWidth={1}
          margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
          xScale={{ max: new Date(times.timeEnd * 1000), min: new Date(times.timeStart * 1000), type: 'time' }}
          yScale={{ stacked: false, type: 'linear' }}
        />
      </div>
    </div>
  );
};

export default ApplicationDetailsChartSparkline;
