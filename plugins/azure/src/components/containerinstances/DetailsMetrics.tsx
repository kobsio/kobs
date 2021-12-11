import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import React, { useState } from 'react';

import { IPluginTimes } from '@kobsio/plugin-core';
import Metric from '../metrics/Metric';
import MetricsToolbar from '../metrics/MetricsToolbar';
import { services } from '../../utils/services';

const provider = services['containerinstances'].provider;

interface IDetailsMetricsProps {
  name: string;
  resourceGroup: string;
  containerGroup: string;
}

const DetailsMetrics: React.FunctionComponent<IDetailsMetricsProps> = ({
  name,
  resourceGroup,
  containerGroup,
}: IDetailsMetricsProps) => {
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
          <CardTitle>CPU Usage</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              name={name}
              resourceGroup={resourceGroup}
              provider={provider + containerGroup}
              metricNames="CPUUsage"
              aggregationType="Average"
              times={times}
            />
          </div>
        </CardBody>
      </Card>

      <p>&nbsp;</p>
      <Card isCompact={true}>
        <CardHeader>
          <CardTitle>Memory Usage</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              name={name}
              resourceGroup={resourceGroup}
              provider={provider + containerGroup}
              metricNames="MemoryUsage"
              aggregationType="Average"
              times={times}
            />
          </div>
        </CardBody>
      </Card>

      <p>&nbsp;</p>
      <Card isCompact={true}>
        <CardHeader>
          <CardTitle>Network Bytes</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              name={name}
              resourceGroup={resourceGroup}
              provider={provider + containerGroup}
              metricNames="NetworkBytesReceivedPerSecond,NetworkBytesTransmittedPerSecond"
              aggregationType="Average"
              times={times}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DetailsMetrics;
