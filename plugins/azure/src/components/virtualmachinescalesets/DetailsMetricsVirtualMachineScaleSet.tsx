import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import React, { useState } from 'react';

import { IPluginTimes } from '@kobsio/plugin-core';
import Metric from '../metrics/Metric';
import MetricsToolbar from '../metrics/MetricsToolbar';
import { services } from '../../utils/services';

const provider = services['virtualmachinescalesets'].provider;

interface IDetailsMetricsVirtualMachineScaleSetProps {
  name: string;
  resourceGroup: string;
  virtualMachineScaleSet: string;
}

const DetailsMetricsVirtualMachineScaleSet: React.FunctionComponent<IDetailsMetricsVirtualMachineScaleSetProps> = ({
  name,
  resourceGroup,
  virtualMachineScaleSet,
}: IDetailsMetricsVirtualMachineScaleSetProps) => {
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
          <CardTitle>CPU Usage (Average)</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              name={name}
              resourceGroup={resourceGroup}
              provider={provider + virtualMachineScaleSet}
              metricNames="Percentage CPU"
              aggregationType="Average"
              times={times}
            />
          </div>
        </CardBody>
      </Card>

      <p>&nbsp;</p>
      <Card isCompact={true}>
        <CardHeader>
          <CardTitle>Available Memory Bytes (Average)</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              name={name}
              resourceGroup={resourceGroup}
              provider={provider + virtualMachineScaleSet}
              metricNames="Available Memory Bytes"
              aggregationType="Average"
              times={times}
            />
          </div>
        </CardBody>
      </Card>

      <p>&nbsp;</p>
      <Card isCompact={true}>
        <CardHeader>
          <CardTitle>Network (Total)</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              name={name}
              resourceGroup={resourceGroup}
              provider={provider + virtualMachineScaleSet}
              metricNames="Network In Total,Network Out Total"
              aggregationType="Total"
              times={times}
            />
          </div>
        </CardBody>
      </Card>

      <p>&nbsp;</p>
      <Card isCompact={true}>
        <CardHeader>
          <CardTitle>Disk Bytes (Total)</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              name={name}
              resourceGroup={resourceGroup}
              provider={provider + virtualMachineScaleSet}
              metricNames="Disk Read Bytes,Disk Write Bytes"
              aggregationType="Total"
              times={times}
            />
          </div>
        </CardBody>
      </Card>

      <p>&nbsp;</p>
      <Card isCompact={true}>
        <CardHeader>
          <CardTitle>Disk Operations/Sec (Average)</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ height: '300px' }}>
            <Metric
              name={name}
              resourceGroup={resourceGroup}
              provider={provider + virtualMachineScaleSet}
              metricNames="Disk Read Operations/Sec,Disk Write Operations/Sec"
              aggregationType="Average"
              times={times}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DetailsMetricsVirtualMachineScaleSet;
