import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import React, { useState } from 'react';

import { IPluginTimes } from '@kobsio/plugin-core';
import Metric from '../metrics/Metric';
import MetricsToolbar from '../metrics/MetricsToolbar';
import { services } from '../../utils/services';

const provider = services['kubernetesservices'].provider;

interface IDetailsMetricsNodeProps {
  name: string;
  resourceGroup: string;
  managedCluster: string;
}

const DetailsMetricsNode: React.FunctionComponent<IDetailsMetricsNodeProps> = ({
  name,
  resourceGroup,
  managedCluster,
}: IDetailsMetricsNodeProps) => {
  const [times, setTimes] = useState<IPluginTimes>({
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
          <CardTitle>Total Number of Available CPU Cores in the Managed Cluster</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              name={name}
              resourceGroup={resourceGroup}
              provider={provider + managedCluster}
              metricName="kube_node_status_allocatable_cpu_cores"
              times={times}
            />
          </div>
        </CardBody>
      </Card>

      <p>&nbsp;</p>
      <Card isCompact={true}>
        <CardHeader>
          <CardTitle>Total Amount of Available Memory in the Managed Cluster</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              name={name}
              resourceGroup={resourceGroup}
              provider={provider + managedCluster}
              metricName="kube_node_status_allocatable_memory_bytes"
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
              name={name}
              resourceGroup={resourceGroup}
              provider={provider + managedCluster}
              metricName="kube_node_status_condition"
              times={times}
            />
          </div>
        </CardBody>
      </Card>

      <p>&nbsp;</p>
      <Card isCompact={true}>
        <CardHeader>
          <CardTitle>Average CPU Utilization Measured in Percentage</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              name={name}
              resourceGroup={resourceGroup}
              provider={provider + managedCluster}
              metricName="node_cpu_usage_percentage"
              times={times}
            />
          </div>
        </CardBody>
      </Card>

      <p>&nbsp;</p>
      <Card isCompact={true}>
        <CardHeader>
          <CardTitle>Container RSS Memory Used in Percent</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              name={name}
              resourceGroup={resourceGroup}
              provider={provider + managedCluster}
              metricName="node_memory_rss_percentage"
              times={times}
            />
          </div>
        </CardBody>
      </Card>

      <p>&nbsp;</p>
      <Card isCompact={true}>
        <CardHeader>
          <CardTitle>Container Working Set Memory Used in Percent</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              name={name}
              resourceGroup={resourceGroup}
              provider={provider + managedCluster}
              metricName="node_memory_working_set_percentage"
              times={times}
            />
          </div>
        </CardBody>
      </Card>

      <p>&nbsp;</p>
      <Card isCompact={true}>
        <CardHeader>
          <CardTitle>Disk Space Used in Percent</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              name={name}
              resourceGroup={resourceGroup}
              provider={provider + managedCluster}
              metricName="node_disk_usage_percentage"
              times={times}
            />
          </div>
        </CardBody>
      </Card>

      <p>&nbsp;</p>
      <Card isCompact={true}>
        <CardHeader>
          <CardTitle>Network Received Bytes</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              name={name}
              resourceGroup={resourceGroup}
              provider={provider + managedCluster}
              metricName="node_network_in_bytes"
              times={times}
            />
          </div>
        </CardBody>
      </Card>

      <p>&nbsp;</p>
      <Card isCompact={true}>
        <CardHeader>
          <CardTitle>Network Transmitted Bytes</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              name={name}
              resourceGroup={resourceGroup}
              provider={provider + managedCluster}
              metricName="node_network_out_bytes"
              times={times}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DetailsMetricsNode;
