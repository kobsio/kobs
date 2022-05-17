import { TableComposable, TableVariant, Th, Thead, Tr } from '@patternfly/react-table';
import { V1Container, V1ContainerStatus } from '@kubernetes/client-node';
import React from 'react';
import { Title } from '@patternfly/react-core';

import Container from './Container';
import { IMetricContainer } from '../../utils/interfaces';

const getContainerStatus = (name: string, status?: V1ContainerStatus[]): V1ContainerStatus | undefined => {
  if (!status) {
    return undefined;
  }

  for (const s of status) {
    if (s.name === name) {
      return s;
    }
  }

  return undefined;
};

const getContainerMetric = (name: string, metrics?: IMetricContainer[]): IMetricContainer | undefined => {
  if (!metrics) {
    return undefined;
  }

  for (const metric of metrics) {
    if (metric.name === name) {
      return metric;
    }
  }

  return undefined;
};

interface IPodProps {
  title: string;
  containers: V1Container[];
  containerStatuses?: V1ContainerStatus[];
  containerMetrics?: IMetricContainer[];
}

const Containers: React.FunctionComponent<IPodProps> = ({
  title,
  containers,
  containerStatuses,
  containerMetrics,
}: IPodProps) => {
  return (
    <React.Fragment>
      <Title headingLevel="h4" size="lg">
        {title}
      </Title>
      <TableComposable aria-label={title} variant={TableVariant.compact} borders={true}>
        <Thead>
          <Tr>
            <Th />
            <Th>Name</Th>
            <Th>Ready</Th>
            <Th>Restarts</Th>
            <Th>Status</Th>
            <Th>CPU Usage</Th>
            <Th>CPU Requests</Th>
            <Th>CPU Limits</Th>
            <Th>Memory Usage</Th>
            <Th>Memory Requests</Th>
            <Th>Memory Limits</Th>
          </Tr>
        </Thead>

        {containers.map((container) => (
          <Container
            key={container.name}
            container={container}
            containerStatus={getContainerStatus(container.name, containerStatuses)}
            containerMetric={getContainerMetric(container.name, containerMetrics)}
          />
        ))}
      </TableComposable>
    </React.Fragment>
  );
};

export default Containers;
