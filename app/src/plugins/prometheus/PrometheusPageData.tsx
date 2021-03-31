import {
  Card,
  CardBody,
  Flex,
  FlexItem,
  SimpleList,
  SimpleListItem,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import React, { useState } from 'react';

import { Metrics } from 'proto/prometheus_grpc_web_pb';
import PrometheusChartDefault from 'plugins/prometheus/PrometheusChartDefault';

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
  const [selectedMetrics, setSelectedMetrics] = useState<Metrics.AsObject[]>([]);

  // select is used to select a single metric, which should be shown in the rendered chart. If the currently selected
  // metric is clicked again, the filter will be removed and all metrics will be shown in the chart.
  const select = (metric: Metrics.AsObject): void => {
    if (selectedMetrics.length === 1 && selectedMetrics[0].label === metric.label) {
      setSelectedMetrics(metrics);
    } else {
      setSelectedMetrics([metric]);
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
          disableLegend={true}
          metrics={selectedMetrics.length === 0 ? metrics : selectedMetrics}
        />

        <p>&nbsp;</p>

        <SimpleList aria-label="Prometheus Data" isControlled={false}>
          {metrics.map((metric, index) => (
            <SimpleListItem
              key={index}
              onClick={(): void => select(metric)}
              isActive={selectedMetrics.length === 1 && selectedMetrics[0].label === metric.label}
            >
              {metric.label === '{}' && metrics.length === queries.length ? queries[index] : metric.label}
              <span style={{ float: 'right' }}>{metric.dataList[metric.dataList.length - 1].y}</span>
            </SimpleListItem>
          ))}
        </SimpleList>
      </CardBody>
    </Card>
  );
};

export default PrometheusPageData;
