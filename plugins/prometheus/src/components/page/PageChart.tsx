import { Card, CardBody, Flex, FlexItem, ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import React, { useState } from 'react';
import { ResponsiveLineCanvas, Serie } from '@nivo/line';

import { CHART_THEME, COLOR_SCALE, ChartTooltip } from '@kobsio/plugin-core';
import { ISeries } from '../../utils/interfaces';
import PageChartLegend from './PageChartLegend';
import { formatAxisBottom } from '../../utils/helpers';

interface IPageChartProps {
  queries: string[];
  series: ISeries;
}

// The PageChart component is used to render the chart for the given metrics. Above the chart we display two toggle
// groups so that the user can adjust the basic style of the chart. The user can switch between a line and area chart
// and between a stacked and unstacked visualization. At the bottom of the page we are including the PageChartLegend
// component to render the legend for the metrics.
const PageChart: React.FunctionComponent<IPageChartProps> = ({ queries, series }: IPageChartProps) => {
  const [type, setType] = useState<string>('line');
  const [stacked, setStacked] = useState<boolean>(false);
  const [selectedSeries, setSelectedSeries] = useState<Serie[]>(series.series);

  // select is used to select a single metric, which should be shown in the rendered chart. If the currently selected
  // metric is clicked again, the filter will be removed and all metrics will be shown in the chart.
  const select = (color: string, metric: Serie): void => {
    if (selectedSeries.length === 1 && selectedSeries[0].label === metric.label) {
      setSelectedSeries(series.series);
    } else {
      setSelectedSeries([{ ...metric, color: color }]);
    }
  };

  return (
    <Card>
      <CardBody>
        <Flex>
          <FlexItem>
            <ToggleGroup aria-label="Chart Type">
              <ToggleGroupItem text="Line" isSelected={type === 'line'} onChange={(): void => setType('line')} />
              <ToggleGroupItem text="Area" isSelected={type === 'area'} onChange={(): void => setType('area')} />
            </ToggleGroup>
          </FlexItem>
          <FlexItem>
            <ToggleGroup aria-label="Stacked Chart">
              <ToggleGroupItem text="Unstacked" isSelected={!stacked} onChange={(): void => setStacked(false)} />
              <ToggleGroupItem text="Stacked" isSelected={stacked} onChange={(): void => setStacked(true)} />
            </ToggleGroup>
          </FlexItem>
        </Flex>
        <p>&nbsp;</p>
        <div style={{ height: '350px' }}>
          <ResponsiveLineCanvas
            axisBottom={{
              format: formatAxisBottom(series.startTime, series.endTime),
            }}
            axisLeft={{
              format: '>-.2f',
              legend: 'Value',
              legendOffset: -40,
              legendPosition: 'middle',
            }}
            colors={COLOR_SCALE}
            curve="monotoneX"
            data={selectedSeries}
            enableArea={type === 'area'}
            enableGridX={false}
            enableGridY={true}
            enablePoints={false}
            xFormat="time:%Y-%m-%d %H:%M:%S"
            lineWidth={1}
            margin={{ bottom: 25, left: 50, right: 0, top: 0 }}
            theme={CHART_THEME}
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            tooltip={(tooltip) => {
              const isFirstHalf = new Date(tooltip.point.data.x).getTime() < (series.endTime + series.startTime) / 2;

              return (
                <ChartTooltip
                  anchor={isFirstHalf ? 'right' : 'left'}
                  color={tooltip.point.color}
                  label={`${series.labels[tooltip.point.id.split('.')[0]]}: ${tooltip.point.data.yFormatted}`}
                  position={[0, 20]}
                  title={tooltip.point.data.xFormatted.toString()}
                />
              );
            }}
            xScale={{ max: new Date(series.endTime), min: new Date(series.startTime), type: 'time' }}
            yScale={{ stacked: stacked, type: 'linear' }}
            yFormat=" >-.4f"
          />
        </div>
        <p>&nbsp;</p>
        <PageChartLegend queries={queries} series={series.series} selected={selectedSeries} select={select} />
      </CardBody>
    </Card>
  );
};

export default PageChart;
