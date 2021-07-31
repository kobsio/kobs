import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import React from 'react';
import { ResponsiveLineCanvas } from '@nivo/line';
import { SquareIcon } from '@patternfly/react-icons';

import { COLOR_SCALE } from '../../../utils/colors';
import { IChart } from '../../../utils/interfaces';
import { IPluginTimes } from '@kobsio/plugin-core';
import { formatAxisBottom } from '../../../utils/helpers';

interface IChartProps {
  times: IPluginTimes;
  chart: IChart;
}

export const Chart: React.FunctionComponent<IChartProps> = ({ times, chart }: IChartProps) => {
  return (
    <Card isCompact={true}>
      <CardTitle>{chart.title}</CardTitle>
      <CardBody>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveLineCanvas
            axisBottom={{
              format: formatAxisBottom(times),
            }}
            axisLeft={{
              format: '>-.2f',
              legend: chart.unit,
              legendOffset: -40,
              legendPosition: 'middle',
            }}
            colors={COLOR_SCALE}
            curve="monotoneX"
            data={chart.series}
            enableArea={false}
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
                  <SquareIcon color={tooltip.point.color} />{' '}
                  {chart.series.filter((serie) => serie.id === tooltip.point.serieId)[0].label}:{' '}
                  {tooltip.point.data.yFormatted} {chart.unit}
                </div>
              </div>
            )}
            xScale={{ type: 'time' }}
            yScale={{ max: 'auto', min: 'auto', stacked: false, type: 'linear' }}
            yFormat=" >-.2f"
          />
        </div>
      </CardBody>
    </Card>
  );
};

export default Chart;
