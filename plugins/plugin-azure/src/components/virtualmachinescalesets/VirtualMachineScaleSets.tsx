import { Alert, AlertActionLink, AlertVariant, DataList, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

import Details from './Details';
import { IPluginInstance } from '@kobsio/shared';
import { IVirtualMachineScaleSet } from './interfaces';
import VirtualMachineScaleSetsItem from './VirtualMachineScaleSetsItem';
import { getResourceGroupFromID } from '../../utils/helpers';

interface IVirtualMachineScaleSetsProps {
  instance: IPluginInstance;
  resourceGroups: string[];
  setDetails?: (details: React.ReactNode) => void;
}

const VirtualMachineScaleSets: React.FunctionComponent<IVirtualMachineScaleSetsProps> = ({
  instance,
  resourceGroups,
  setDetails,
}: IVirtualMachineScaleSetsProps) => {
  const [selectedVirtualMachineScaleSet, setSelectedVirtualMachineScaleSet] = useState<string>();
  const location = useLocation();
  const resourceGroup = new URLSearchParams(location.search).get('resourceGroup');

  const selectVirtualMachineScaleSet = (id: string): void => {
    const selectedVirtualMachineScaleSets = data?.filter((countainerGroup) => countainerGroup.id === id);
    if (setDetails && selectedVirtualMachineScaleSets?.length === 1) {
      const resourceGroup = selectedVirtualMachineScaleSets[0].id
        ? getResourceGroupFromID(selectedVirtualMachineScaleSets[0].id)
        : '';

      setSelectedVirtualMachineScaleSet(selectedVirtualMachineScaleSets[0].id);
      setDetails(
        <Details
          instance={instance}
          resourceGroup={resourceGroup}
          virtualMachineScaleSet={selectedVirtualMachineScaleSets[0].name || ''}
          close={(): void => {
            setSelectedVirtualMachineScaleSet(undefined);
            setDetails(undefined);
          }}
        />,
      );
    }
  };

  const { isError, isLoading, error, data, refetch } = useQuery<IVirtualMachineScaleSet[], Error>(
    ['azure/virtualmachinescalesets/virtualmachinescalesets', instance, resourceGroups, resourceGroup],
    async () => {
      try {
        const resourceGroupsParams = resourceGroup
          ? `resourceGroup=${resourceGroup}`
          : resourceGroups.map((rg) => `resourceGroup=${rg}`).join('&');

        const response = await fetch(
          `/api/plugins/azure/virtualmachinescalesets/virtualmachinescalesets?${resourceGroupsParams}`,
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
            throw new Error('An unknown error occurred');
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
        title="Could not get virtual machine scale sets"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IVirtualMachineScaleSet[], Error>> => refetch()}>
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
    <DataList
      aria-label="container groups list"
      selectedDataListItemId={selectedVirtualMachineScaleSet}
      onSelectDataListItem={selectVirtualMachineScaleSet}
    >
      {data.map((virtualMachineScaleSet) => (
        <VirtualMachineScaleSetsItem key={virtualMachineScaleSet.id} virtualMachineScaleSet={virtualMachineScaleSet} />
      ))}
    </DataList>
  );
};

export default VirtualMachineScaleSets;
