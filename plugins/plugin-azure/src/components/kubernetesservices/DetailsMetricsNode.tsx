import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import React, { useState } from 'react';

import { IPluginInstance, ITimes } from '@kobsio/shared';
import Metric from '../metrics/Metric';
import MetricsToolbar from '../metrics/MetricsToolbar';
import { services } from '../../utils/services';

const provider = services['kubernetesservices'].provider;

interface IDetailsMetricsNodeProps {
  instance: IPluginInstance;
  resourceGroup: string;
  managedCluster: string;
}

const DetailsMetricsNode: React.FunctionComponent<IDetailsMetricsNodeProps> = ({
  instance,
  resourceGroup,
  managedCluster,
}: IDetailsMetricsNodeProps) => {
  const [times, setTimes] = useState<ITimes>({
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  });

  return (
    <div>
      <MetricsToolbar times={times} setTimes={setTimes} />
      <p>&nbsp;</p>
      <Card isCompact={true}>
        <CardHeader>
          <CardTitle>Total Number of Available CPU Cores</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              instance={instance}
              resourceGroup={resourceGroup}
              provider={provider + managedCluster}
              metricNames="kube_node_status_allocatable_cpu_cores"
              aggregationType="Average"
              times={times}
            />
          </div>
        </CardBody>
      </Card>

      <p>&nbsp;</p>
      <Card isCompact={true}>
        <CardHeader>
          <CardTitle>Total Amount of Available Memory</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              instance={instance}
              resourceGroup={resourceGroup}
              provider={provider + managedCluster}
              metricNames="kube_node_status_allocatable_memory_bytes"
              aggregationType="Average"
              times={times}
            />
          </div>
        </CardBody>
      </Card>

      <p>&nbsp;</p>
      <Card isCompact={true}>
        <CardHeader>
          <CardTitle>Statuses for Various Node Conditions</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              instance={instance}
              resourceGroup={resourceGroup}
              provider={provider + managedCluster}
              metricNames="kube_node_status_condition"
              aggregationType="Average"
              times={times}
            />
          </div>
        </CardBody>
      </Card>

      <p>&nbsp;</p>
      <Card isCompact={true}>
        <CardHeader>
          <CardTitle>Average CPU Utilization</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              instance={instance}
              resourceGroup={resourceGroup}
              provider={provider + managedCluster}
              metricNames="node_cpu_usage_percentage"
              aggregationType="Average"
              times={times}
            />
          </div>
        </CardBody>
      </Card>

      <p>&nbsp;</p>
      <Card isCompact={true}>
        <CardHeader>
          <CardTitle>Container Memory Used</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              instance={instance}
              resourceGroup={resourceGroup}
              provider={provider + managedCluster}
              metricNames="node_memory_rss_percentage,node_memory_working_set_percentage"
              aggregationType="Average"
              times={times}
            />
          </div>
        </CardBody>
      </Card>

      <p>&nbsp;</p>
      <Card isCompact={true}>
        <CardHeader>
          <CardTitle>Disk Space Used</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              instance={instance}
              resourceGroup={resourceGroup}
              provider={provider + managedCluster}
              metricNames="node_disk_usage_percentage"
              aggregationType="Average"
              times={times}
            />
          </div>
        </CardBody>
      </Card>

      <p>&nbsp;</p>
      <Card isCompact={true}>
        <CardHeader>
          <CardTitle>Network</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              instance={instance}
              resourceGroup={resourceGroup}
              provider={provider + managedCluster}
              metricNames="node_network_in_bytes,node_network_out_bytes"
              aggregationType="Average"
              times={times}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DetailsMetricsNode;
