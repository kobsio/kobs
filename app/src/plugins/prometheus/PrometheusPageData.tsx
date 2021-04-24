import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  Flex,
  FlexItem,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { EyeSlashIcon, SquareIcon } from '@patternfly/react-icons';
import React, { useState } from 'react';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { Metrics } from 'proto/prometheus_grpc_web_pb';
import PrometheusChartDefault from 'plugins/prometheus/PrometheusChartDefault';
import { getLegendColorClass } from 'plugins/prometheus/helpers';

interface ISelectedMetrics {
  color?: string;
  metrics: Metrics.AsObject[];
}

interface IPrometheusPageDataProps {
  metrics: Metrics.AsObject[];
  queries: string[];
}

// PrometheusPageData is used to render the fetched metrics, for the user provided queries. By default the corresponding
// chart will render all loaded metrics. When the user selects a specific metric, the chart will only render this
// metrics. A user can also decided, how he wants to see his data: As line vs. area chart or unstacked vs. stacked.
const PrometheusPageData: React.FunctionComponent<IPrometheusPageDataProps> = ({
  metrics,
  queries,
}: IPrometheusPageDataProps) => {
  const [type, setType] = useState<string>('line');
  const [stacked, setStacked] = useState<boolean>(false);
  const [selectedMetrics, setSelectedMetrics] = useState<ISelectedMetrics>({ color: undefined, metrics: metrics });

  // select is used to select a single metric, which should be shown in the rendered chart. If the currently selected
  // metric is clicked again, the filter will be removed and all metrics will be shown in the chart.
  const select = (metric: Metrics.AsObject, color: string): void => {
    if (selectedMetrics.metrics.length === 1 && selectedMetrics.metrics[0].label === metric.label) {
      setSelectedMetrics({ color: undefined, metrics: metrics });
    } else {
      setSelectedMetrics({ color: color, metrics: [metric] });
    }
  };

  // When their are no metrics we do not render anything.
  if (metrics.length === 0) {
    return null;
  }

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

        <PrometheusChartDefault
          type={type}
          unit=""
          stacked={stacked}
          legend="disabled"
          color={selectedMetrics.metrics.length === 1 ? selectedMetrics.color : undefined}
          metrics={selectedMetrics.metrics}
        />

        <p>&nbsp;</p>

        <TableComposable aria-label="Legend" variant={TableVariant.compact} borders={false}>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Min</Th>
              <Th>Max</Th>
              <Th>Avg</Th>
              <Th>Current</Th>
            </Tr>
          </Thead>
          <Tbody>
            {metrics.map((metric, index) => (
              <Tr key={index}>
                <Td dataLabel="Name">
                  <Button
                    className={
                      selectedMetrics.metrics.length === 1 && selectedMetrics.metrics[0].label !== metric.label
                        ? 'pf-u-color-400'
                        : ''
                    }
                    style={{ color: 'inherit', textDecoration: 'inherit' }}
                    variant={ButtonVariant.link}
                    isInline={true}
                    icon={
                      selectedMetrics.metrics.length === 1 && selectedMetrics.metrics[0].label !== metric.label ? (
                        <EyeSlashIcon />
                      ) : (
                        <SquareIcon color={getLegendColorClass(index)} />
                      )
                    }
                    onClick={(): void => select(metric, getLegendColorClass(index))}
                  >
                    {metric.label === '{}' && metrics.length === queries.length ? queries[index] : metric.label}
                  </Button>
                </Td>
                <Td dataLabel="Min">{metric.min}</Td>
                <Td dataLabel="Max">{metric.max}</Td>
                <Td dataLabel="Avg">{metric.avg}</Td>
                <Td dataLabel="Current">{metric.dataList[metric.dataList.length - 1].y}</Td>
              </Tr>
            ))}
          </Tbody>
        </TableComposable>
      </CardBody>
    </Card>
  );
};

export default PrometheusPageData;
