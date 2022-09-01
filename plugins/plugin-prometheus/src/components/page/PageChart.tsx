import { Card, CardBody, Flex, FlexItem, ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import React, { useState } from 'react';

import { ITimes, getColor } from '@kobsio/shared';
import ChartTimeseries from '../panel/ChartTimeseries';
import { IMetric } from '../../utils/interfaces';
import PageChartLegend from './PageChartLegend';

interface IPageChartProps {
  queries: string[];
  metrics: IMetric[];
  times: ITimes;
}

const PageChart: React.FunctionComponent<IPageChartProps> = ({ queries, metrics, times }: IPageChartProps) => {
  const [type, setType] = useState<'line' | 'area' | 'bar'>('line');
  const [stacked, setStacked] = useState<boolean>(false);
  const [selectedMetric, setSelectedMetric] = useState<number>(-1);

  const select = (index: number): void => {
    if (selectedMetric === index) {
      setSelectedMetric(-1);
    } else {
      setSelectedMetric(index);
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
              <ToggleGroupItem text="Bar" isSelected={type === 'bar'} onChange={(): void => setType('bar')} />
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
          <ChartTimeseries
            metrics={selectedMetric === -1 ? metrics : [metrics[selectedMetric]]}
            type={type}
            stacked={stacked}
            color={selectedMetric === -1 ? undefined : getColor(selectedMetric)}
            times={times}
          />
        </div>

        <p>&nbsp;</p>

        <PageChartLegend queries={queries} metrics={metrics} selected={selectedMetric} select={select} />
      </CardBody>
    </Card>
  );
};

export default PageChart;
