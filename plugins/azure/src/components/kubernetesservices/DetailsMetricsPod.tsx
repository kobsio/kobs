import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import React, { useState } from 'react';

import { IPluginTimes } from '@kobsio/plugin-core';
import Metric from '../metrics/Metric';
import MetricsToolbar from '../metrics/MetricsToolbar';
import { services } from '../../utils/services';

const provider = services['kubernetesservices'].provider;

interface IDetailsMetricsPodProps {
  name: string;
  resourceGroup: string;
  managedCluster: string;
}

const DetailsMetricsPod: React.FunctionComponent<IDetailsMetricsPodProps> = ({
  name,
  resourceGroup,
  managedCluster,
}: IDetailsMetricsPodProps) => {
  const [times, setTimes] = useState<IPluginTimes>({
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  });

  return (
    <div>
      <MetricsToolbar times={times} setTimes={setTimes} />
      <p>&nbsp;</p>
      <Card isCompact={true}>
        <CardHeader>
          <CardTitle>Number of Pods in Ready State</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              name={name}
              resourceGroup={resourceGroup}
              provider={provider + managedCluster}
              metricName="kube_pod_status_ready"
              times={times}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DetailsMetricsPod;
