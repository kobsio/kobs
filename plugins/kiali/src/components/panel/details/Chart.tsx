import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import React from 'react';
import { ResponsiveLineCanvas } from '@nivo/line';

import { CHART_THEME, COLOR_SCALE, ChartTooltip } from '@kobsio/plugin-core';
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
            theme={CHART_THEME}
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            tooltip={(tooltip) => (
              <ChartTooltip
                color={tooltip.point.color}
                label={`${chart.series.filter((serie) => serie.id === tooltip.point.serieId)[0].label}: ${
                  tooltip.point.data.yFormatted
                } ${chart.unit}`}
                title={tooltip.point.data.xFormatted.toString()}
              />
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
