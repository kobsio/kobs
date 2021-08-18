import { Card, CardBody, Flex, FlexItem, ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import React, { useState } from 'react';
import { ResponsiveLineCanvas, Serie } from '@nivo/line';
import { SquareIcon } from '@patternfly/react-icons';
import { TooltipWrapper } from '@nivo/tooltip';

import { convertMetrics, formatAxisBottom } from '../../utils/helpers';
import { COLOR_SCALE } from '../../utils/colors';
import { IMetrics } from '../../utils/interfaces';
import PageChartLegend from './PageChartLegend';

interface IPageChartProps {
  queries: string[];
  metrics: IMetrics;
}

// The PageChart component is used to render the chart for the given metrics. Above the chart we display two toggle
// groups so that the user can adjust the basic style of the chart. The user can switch between a line and area chart
// and between a stacked and unstacked visualization. At the bottom of the page we are including the PageChartLegend
// component to render the legend for the metrics.
const PageChart: React.FunctionComponent<IPageChartProps> = ({ queries, metrics }: IPageChartProps) => {
  // series is an array for the converted metrics, which can be used by nivo. We convert the metrics to a series, so
  // that we have to do this onyl once and not everytime the selected metrics are changed.
  const seriesData = convertMetrics(metrics.metrics, metrics.startTime, metrics.endTime, metrics.min, metrics.max);

  const [type, setType] = useState<string>('line');
  const [stacked, setStacked] = useState<boolean>(false);
  const [selectedSeries, setSelectedSeries] = useState<Serie[]>(seriesData.series);

  // select is used to select a single metric, which should be shown in the rendered chart. If the currently selected
  // metric is clicked again, the filter will be removed and all metrics will be shown in the chart.
  const select = (color: string, metric: Serie): void => {
    if (selectedSeries.length === 1 && selectedSeries[0].label === metric.label) {
      setSelectedSeries(seriesData.series);
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
              format: formatAxisBottom(metrics.startTime, metrics.endTime),
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
            theme={{
              background: '#ffffff',
              fontFamily: 'RedHatDisplay, Overpass, overpass, helvetica, arial, sans-serif',
              fontSize: 10,
              textColor: '#000000',
            }}
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            tooltip={(tooltip) => {
              const isFirstHalf = new Date(tooltip.point.data.x).getTime() < (metrics.endTime + metrics.startTime) / 2;

              return (
                <TooltipWrapper anchor={isFirstHalf ? 'right' : 'left'} position={[0, 20]}>
                  <div
                    className="pf-u-box-shadow-sm"
                    style={{
                      background: '#ffffff',
                      fontSize: '12px',
                      padding: '12px',
                      width: '300px',
                    }}
                  >
                    <div>
                      <b>{tooltip.point.data.xFormatted}</b>
                    </div>
                    <div>
                      <SquareIcon color={tooltip.point.color} /> {seriesData.labels[tooltip.point.id.split('.')[0]]}:{' '}
                      {tooltip.point.data.yFormatted}
                    </div>
                  </div>
                </TooltipWrapper>
              );
            }}
            xScale={{ max: new Date(metrics.endTime), min: new Date(metrics.startTime), type: 'time' }}
            yScale={{ stacked: stacked, type: 'linear' }}
            yFormat=" >-.4f"
          />
        </div>
        <p>&nbsp;</p>
        <PageChartLegend queries={queries} series={seriesData.series} selected={selectedSeries} select={select} />
      </CardBody>
    </Card>
  );
};

export default PageChart;
