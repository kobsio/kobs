import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import React, { useState } from 'react';

import { IPluginTimes } from '@kobsio/plugin-core';
import Metric from '../metrics/Metric';
import MetricsToolbar from '../metrics/MetricsToolbar';
import { services } from '../../utils/services';

const provider = services['kubernetesservices'].provider;

interface IDetailsMetricsAPIServerProps {
  name: string;
  resourceGroup: string;
  managedCluster: string;
}

const DetailsMetricsAPIServer: React.FunctionComponent<IDetailsMetricsAPIServerProps> = ({
  name,
  resourceGroup,
  managedCluster,
}: IDetailsMetricsAPIServerProps) => {
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
          <CardTitle>Inflight Requests</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              name={name}
              resourceGroup={resourceGroup}
              provider={provider + managedCluster}
              metricName="apiserver_current_inflight_requests"
              times={times}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DetailsMetricsAPIServer;
