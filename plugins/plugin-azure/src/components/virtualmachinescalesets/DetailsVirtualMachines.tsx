import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import { TableComposable, TableVariant, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import DetailsVirtualMachinesItem from './DetailsVirtualMachinesItem';
import { IPluginInstance } from '@kobsio/shared';
import { IVirtualMachine } from './interfaces';

interface IDetailsVirtualMachinesProps {
  instance: IPluginInstance;
  resourceGroup: string;
  virtualMachineScaleSet: string;
}

const DetailsVirtualMachines: React.FunctionComponent<IDetailsVirtualMachinesProps> = ({
  instance,
  resourceGroup,
  virtualMachineScaleSet,
}: IDetailsVirtualMachinesProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IVirtualMachine[], Error>(
    ['azure/virtualmachinescalesets/virtualmachines', instance, resourceGroup, virtualMachineScaleSet],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/azure/virtualmachinescalesets/virtualmachines?resourceGroup=${resourceGroup}&virtualMachineScaleSet=${virtualMachineScaleSet}`,
          {
            headers: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'x-kobs-plugin': instance.name,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'x-kobs-satellite': instance.satellite,
            },
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

  if (!data) {
    return null;
  }

  return (
    <div className="kobsio-hide-scrollbar" style={{ maxWidth: '100%', overflow: 'auto' }}>
      <TableComposable aria-label="Virtual Machines" variant={TableVariant.compact} borders={true}>
        <Thead>
          <Tr>
            <Th />
            <Th>Name</Th>
            <Th>Computer Name</Th>
            <Th>Provisioning State</Th>
            <Th>Latest Model</Th>
          </Tr>
        </Thead>
        {data.map((virtualMachine) => (
          <DetailsVirtualMachinesItem
            key={virtualMachine.id || ''}
            instance={instance}
            resourceGroup={resourceGroup}
            virtualMachineScaleSet={virtualMachineScaleSet}
            virtualMachine={virtualMachine}
          />
        ))}
      </TableComposable>
    </div>
  );
};

export default DetailsVirtualMachines;