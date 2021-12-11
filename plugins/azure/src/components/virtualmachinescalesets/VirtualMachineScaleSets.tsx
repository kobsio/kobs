import { Alert, AlertActionLink, AlertVariant, Menu, MenuContent, MenuList, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';
import { useLocation } from 'react-router-dom';

import { IVirtualMachineScaleSet } from './interfaces';
import VirtualMachineScaleSetsItem from './VirtualMachineScaleSetsItem';

interface IVirtualMachineScaleSetsProps {
  name: string;
  resourceGroups: string[];
  setDetails?: (details: React.ReactNode) => void;
}

const VirtualMachineScaleSets: React.FunctionComponent<IVirtualMachineScaleSetsProps> = ({
  name,
  resourceGroups,
  setDetails,
}: IVirtualMachineScaleSetsProps) => {
  const location = useLocation();
  const resourceGroup = new URLSearchParams(location.search).get('resourceGroup');

  const { isError, isLoading, error, data, refetch } = useQuery<IVirtualMachineScaleSet[], Error>(
    ['azure/virtualmachinescalesets/virtualmachinescalesets', name, resourceGroups, resourceGroup],
    async () => {
      try {
        const resourceGroupsParams = resourceGroup
          ? `resourceGroup=${resourceGroup}`
          : resourceGroups.map((rg) => `resourceGroup=${rg}`).join('&');

        const response = await fetch(
          `/api/plugins/azure/${name}/virtualmachinescalesets/virtualmachinescalesets?${resourceGroupsParams}`,
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
    <Menu>
      <MenuContent>
        <MenuList>
          {data.map((virtualMachineScaleSet, index) => (
            <VirtualMachineScaleSetsItem
              key={index}
              name={name}
              virtualMachineScaleSet={virtualMachineScaleSet}
              setDetails={setDetails}
            />
          ))}
        </MenuList>
      </MenuContent>
    </Menu>
  );
};

export default VirtualMachineScaleSets;
