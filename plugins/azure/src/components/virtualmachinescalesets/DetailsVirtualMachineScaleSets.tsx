import {
  Alert,
  AlertActionLink,
  AlertVariant,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { IVirtualMachineScaleSet } from './interfaces';

interface IDetailsVirtualMachineScaleSetsProps {
  name: string;
  resourceGroup: string;
  virtualMachineScaleSet: string;
}

const DetailsVirtualMachineScaleSets: React.FunctionComponent<IDetailsVirtualMachineScaleSetsProps> = ({
  name,
  resourceGroup,
  virtualMachineScaleSet,
}: IDetailsVirtualMachineScaleSetsProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IVirtualMachineScaleSet, Error>(
    ['azure/virtualmachinescalesets/virtualmachinescaleset/details', name, resourceGroup, virtualMachineScaleSet],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/azure/${name}/virtualmachinescalesets/virtualmachinescaleset/details?resourceGroup=${resourceGroup}&virtualMachineScaleSet=${virtualMachineScaleSet}`,
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
        title="Could not get managed cluster details"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IVirtualMachineScaleSet, Error>> => refetch()}>
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
    <div style={{ maxWidth: '100%', overflow: 'auto' }}>
      <DescriptionList className="pf-u-text-break-word" isHorizontal={true}>
        <DescriptionListGroup>
          <DescriptionListTerm>Status</DescriptionListTerm>
          <DescriptionListDescription>{data.properties?.provisioningState || '-'}</DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Zones</DescriptionListTerm>
          <DescriptionListDescription>
            {data.zones ? data.zones.map((zone) => `Zone ${zone}`).join(', ') : '-'}
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Size</DescriptionListTerm>
          <DescriptionListDescription>
            {data.sku?.name || '-'}
            {data.sku?.capacity ? ` (${data.sku?.capacity} Instances)` : ''}
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Upgrade Policy</DescriptionListTerm>
          <DescriptionListDescription>{data.properties?.upgradePolicy?.mode || '-'}</DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Operating System</DescriptionListTerm>
          <DescriptionListDescription>
            {data.properties?.virtualMachineProfile?.storageProfile?.osDisk?.osType || '-'}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>OS Disk</DescriptionListTerm>
          <DescriptionListDescription>
            {data.properties?.virtualMachineProfile?.storageProfile?.osDisk?.managedDisk?.storageAccountType || '-'}
            {data.properties?.virtualMachineProfile?.storageProfile?.osDisk?.diskSizeGB
              ? ` (${data.properties?.virtualMachineProfile?.storageProfile?.osDisk.diskSizeGB} GB)`
              : ''}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </div>
  );
};

export default DetailsVirtualMachineScaleSets;
