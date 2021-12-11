import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useState } from 'react';

import DetailsMetricsVirtualMachineToolbar from './DetailsMetricsVirtualMachineToolbar';
import { IPluginTimes } from '@kobsio/plugin-core';
import { IVirtualMachine } from './interfaces';
import Metric from '../metrics/Metric';
import { services } from '../../utils/services';

const provider = services['virtualmachinescalesets'].provider;

interface IDetailsMetricsVirtualMachineProps {
  name: string;
  resourceGroup: string;
  virtualMachineScaleSet: string;
}

const DetailsMetricsVirtualMachine: React.FunctionComponent<IDetailsMetricsVirtualMachineProps> = ({
  name,
  resourceGroup,
  virtualMachineScaleSet,
}: IDetailsMetricsVirtualMachineProps) => {
  const [selectedVirtualMachine, setSelectedVirtualMachine] = useState<string>('');
  const [times, setTimes] = useState<IPluginTimes>({
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  });

  const { isError, isLoading, error, data, refetch } = useQuery<IVirtualMachine[], Error>(
    ['azure/virtualmachinescalesets/virtualmachines', name, resourceGroup, virtualMachineScaleSet],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/azure/${name}/virtualmachinescalesets/virtualmachines?resourceGroup=${resourceGroup}&virtualMachineScaleSet=${virtualMachineScaleSet}`,
          {
            method: 'get',
          },
        );
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          return json;
        } else {
          if (json.error) {
            throw new Error(json.error);
          } else {
            throw new Error('An unknown error occured');
          }
        }
      } catch (err) {
        throw err;
      }
    },
  );

  if (isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        variant={AlertVariant.danger}
        isInline={true}
        title="Could not get virtual machines"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IVirtualMachine[], Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div>
      <DetailsMetricsVirtualMachineToolbar
        virtualMachines={data
          .map((virtualMachine: IVirtualMachine) => virtualMachine.name || '')
          .filter((virtualMachine) => virtualMachine !== '')}
        // virtualMachines={data}
        selectedVirtualMachine={selectedVirtualMachine}
        setSelectedVirtualMachine={setSelectedVirtualMachine}
        times={times}
        setTimes={setTimes}
      />

      <p>&nbsp;</p>

      {!selectedVirtualMachine ? (
        <Alert variant={AlertVariant.info} isInline={true} title="Select a virtual machines">
          <p>Select a virtual machine for which you want to display the metrics.</p>
        </Alert>
      ) : (
        <div>
          <Card isCompact={true}>
            <CardHeader>
              <CardTitle>CPU Usage (Average)</CardTitle>
            </CardHeader>
            <CardBody>
              <div style={{ height: '300px' }}>
                <Metric
                  name={name}
                  resourceGroup={resourceGroup}
                  provider={
                    provider +
                    virtualMachineScaleSet +
                    '/virtualMachines/' +
                    selectedVirtualMachine.replace(virtualMachineScaleSet + '_', '')
                  }
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
                  provider={
                    provider +
                    virtualMachineScaleSet +
                    '/virtualMachines/' +
                    selectedVirtualMachine.replace(virtualMachineScaleSet + '_', '')
                  }
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
                  provider={
                    provider +
                    virtualMachineScaleSet +
                    '/virtualMachines/' +
                    selectedVirtualMachine.replace(virtualMachineScaleSet + '_', '')
                  }
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
                  provider={
                    provider +
                    virtualMachineScaleSet +
                    '/virtualMachines/' +
                    selectedVirtualMachine.replace(virtualMachineScaleSet + '_', '')
                  }
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
                  provider={
                    provider +
                    virtualMachineScaleSet +
                    '/virtualMachines/' +
                    selectedVirtualMachine.replace(virtualMachineScaleSet + '_', '')
                  }
                  metricNames="Disk Read Operations/Sec,Disk Write Operations/Sec"
                  aggregationType="Average"
                  times={times}
                />
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DetailsMetricsVirtualMachine;
