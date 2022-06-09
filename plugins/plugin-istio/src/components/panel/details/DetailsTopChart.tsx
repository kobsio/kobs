import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import { ResponsiveLineCanvas, Serie } from '@nivo/line';
import React from 'react';

import { CHART_THEME, COLOR_SCALE, ChartTooltip, ITimes } from '@kobsio/shared';
import { formatAxisBottom } from '../../../utils/prometheus/helpers';

interface IDetailsTopChartProps {
  title: string;
  unit: string;
  series: Serie[];
  times: ITimes;
}

const DetailsTopChart: React.FunctionComponent<IDetailsTopChartProps> = ({
  title,
  unit,
  series,
  times,
}: IDetailsTopChartProps) => {
  return (
    <Card isCompact={true}>
      <CardTitle>{title}</CardTitle>
      <CardBody>
        <div style={{ height: '300px' }}>
          <ResponsiveLineCanvas
            axisBottom={{
              format: formatAxisBottom(times.timeStart, times.timeEnd),
            }}
            axisLeft={{
              format: '>-.2f',
              legend: unit,
              legendOffset: -40,
              legendPosition: 'middle',
            }}
            colors={COLOR_SCALE}
            curve="monotoneX"
            data={series}
            enableArea={false}
            enableGridX={false}
            enableGridY={true}
            enablePoints={false}
            xFormat="time:%Y-%m-%d %H:%M:%S"
            lineWidth={1}
            margin={{ bottom: 25, left: 50, right: 0, top: 0 }}
            theme={CHART_THEME}
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            tooltip={(tooltip) => {
              const isFirstHalf =
                Math.floor(new Date(tooltip.point.data.x).getTime() / 1000) < (times.timeEnd + times.timeStart) / 2;

              return (
                <ChartTooltip
                  anchor={isFirstHalf ? 'right' : 'left'}
                  color={tooltip.point.color}
                  label={`${tooltip.point.serieId}: ${tooltip.point.data.yFormatted} ${unit ? unit : ''}`}
                  position={[0, 20]}
                  title={tooltip.point.data.xFormatted.toString()}
                />
              );
            }}
            xScale={{ type: 'time' }}
            yScale={{ max: 'auto', min: 'auto', stacked: false, type: 'linear' }}
            yFormat=" >-.4f"
          />
        </div>
      </CardBody>
    </Card>
  );
};

export default DetailsTopChart;
