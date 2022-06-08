import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import React, { useState } from 'react';

import { IPluginInstance, ITimes } from '@kobsio/shared';
import Metric from '../metrics/Metric';
import MetricsToolbar from '../metrics/MetricsToolbar';
import { services } from '../../utils/services';

const provider = services['kubernetesservices'].provider;

interface IDetailsMetricsAPIServerProps {
  instance: IPluginInstance;
  resourceGroup: string;
  managedCluster: string;
}

const DetailsMetricsAPIServer: React.FunctionComponent<IDetailsMetricsAPIServerProps> = ({
  instance,
  resourceGroup,
  managedCluster,
}: IDetailsMetricsAPIServerProps) => {
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
          <CardTitle>Inflight Requests</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              instance={instance}
              resourceGroup={resourceGroup}
              provider={provider + managedCluster}
              metricNames="apiserver_current_inflight_requests"
              aggregationType="Average"
              times={times}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DetailsMetricsAPIServer;
