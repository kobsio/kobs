import { MenuItem } from '@patternfly/react-core';
import React from 'react';

import Details from './Details';
import { IVirtualMachineScaleSet } from './interfaces';
import { getResourceGroupFromID } from '../../utils/helpers';

interface IContainerGroupsItemProps {
  name: string;
  virtualMachineScaleSet: IVirtualMachineScaleSet;
  setDetails?: (details: React.ReactNode) => void;
}

const ContainerGroupsItem: React.FunctionComponent<IContainerGroupsItemProps> = ({
  name,
  virtualMachineScaleSet,
  setDetails,
}: IContainerGroupsItemProps) => {
  const resourceGroup = virtualMachineScaleSet.id ? getResourceGroupFromID(virtualMachineScaleSet.id) : '';

  return (
    <MenuItem
      description={
        <div>
          <span>
            <span className="pf-u-color-400">Resource Group: </span>
            <b className="pf-u-pr-md">{resourceGroup || '-'}</b>
          </span>
          <span>
            <span className="pf-u-color-400">Location: </span>
            <b className="pf-u-pr-md">{virtualMachineScaleSet.location || '-'}</b>
          </span>
          <span>
            <span className="pf-u-color-400">Provisioning State: </span>
            <b className="pf-u-pr-md">{virtualMachineScaleSet.properties?.provisioningState || '-'}</b>
          </span>
          <span>
            <span className="pf-u-color-400">Size: </span>
            <b className="pf-u-pr-md">{virtualMachineScaleSet.sku?.name || '-'}</b>
          </span>
          <span>
            <span className="pf-u-color-400">Instances: </span>
            <b className="pf-u-pr-md">{virtualMachineScaleSet.sku?.capacity || '-'}</b>
          </span>
        </div>
      }
      onClick={
        setDetails
          ? (): void =>
              setDetails(
                <Details
                  name={name}
                  resourceGroup={resourceGroup}
                  virtualMachineScaleSet={virtualMachineScaleSet.name || ''}
                  close={(): void => setDetails(undefined)}
                />,
              )
          : undefined
      }
    >
      {virtualMachineScaleSet.name}
    </MenuItem>
  );
};

export default ContainerGroupsItem;
